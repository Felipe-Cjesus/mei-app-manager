// app/(tabs)/Invoice.tsx
import Feather from '@expo/vector-icons/Feather';
import { format } from 'date-fns';
import * as DocumentPicker from 'expo-document-picker';
import * as Linking from 'expo-linking';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useEnterprise } from '../../contexts/EnterpriseContext';
import api from '../../services/api';
import Button from '../../src/components/Button';
import DateInput from '../../src/components/DateInput';
import Header from '../../src/components/HeaderSecundary';
import Input from '../../src/components/Input';
import colors from '../../src/theme/colors';

type InvoiceItem = {
  id: number;
  number: string;
  issue_date: string;
  value: number;
  description: string;
  nf_url?: string | null;
  enterprise_id?: number;
};

export default function Invoice() {
  const { activeEnterprise } = useEnterprise();

  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filtros
  const [yearFilter, setYearFilter] = useState<Date | null>(new Date());

  // Modal de inclusão de Nota Fiscal
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Campos do formulário
  const [number, setNumber] = useState('');
  const [issueDate, setIssueDate] = useState<Date>(new Date());
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<any>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const formatDateToDatabase = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
  };

  const fetchInvoices = useCallback(async (pageNumber = 1) => {
    try {
      setLoading(true);

      const params: string[] = [`page=${pageNumber}`, `perPage=15`];

      if (yearFilter) {
        params.push(`year=${format(yearFilter, 'yyyy')}`);
      }
      if (activeEnterprise?.id) {
        params.push(`enterprise_id=${activeEnterprise.id}`);
      }

      const queryString = '?' + params.join('&');
      const response = await api.get('/invoices' + queryString);

      const paginated = response.data?.data;
      if (paginated) {
        setInvoices(paginated.data || []);
        setPage(paginated.current_page || 1);
        setLastPage(paginated.last_page || 1);
        setTotalCount(paginated.total || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar notas fiscais:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar',
        text2: 'Não foi possível buscar as notas fiscais.',
      });
    } finally {
      setLoading(false);
    }
  }, [yearFilter, activeEnterprise?.id]);

  useEffect(() => {
    fetchInvoices(1);
  }, [fetchInvoices]);

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/xml', 'text/xml'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const picked = result.assets[0];

      if (picked.size && picked.size > 2 * 1024 * 1024) {
        Alert.alert('Arquivo muito grande', 'O documento deve ter no máximo 2MB.');
        return;
      }

      setFile(picked);
    } catch (error) {
      console.error('Erro ao selecionar arquivo de NF:', error);
    }
  };

  const handleCreateInvoice = async () => {
    if (!number.trim() || !value.trim() || !description.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Atenção',
        text2: 'Número, valor e descrição são obrigatórios.',
      });
      return;
    }

    const cleanValue = parseFloat(value.replace(',', '.'));
    if (isNaN(cleanValue) || cleanValue <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Valor inválido',
        text2: 'Informe um valor numérico válido.',
      });
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append('number', number.trim());
      formData.append('issue_date', formatDateToDatabase(issueDate));
      formData.append('value', String(cleanValue));
      formData.append('description', description.trim());

      if (activeEnterprise?.id) {
        formData.append('enterprise_id', String(activeEnterprise.id));
      }

      if (file) {
        formData.append('file', {
          uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
          name: file.name,
          type: file.mimeType || 'application/octet-stream',
        } as any);
      }

      await api.post('/invoices', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Toast.show({
        type: 'success',
        text1: 'Sucesso!',
        text2: 'Nota fiscal cadastrada com sucesso ✅',
      });

      // Limpar formulário e fechar modal
      setNumber('');
      setIssueDate(new Date());
      setValue('');
      setDescription('');
      setFile(null);
      setModalVisible(false);

      await fetchInvoices(1);
    } catch (error: any) {
      console.error('Erro ao salvar nota fiscal:', error);
      const msg = error?.response?.data?.message || 'Erro ao cadastrar a nota fiscal.';
      Alert.alert('Erro ao salvar', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteInvoice = (item: InvoiceItem) => {
    Alert.alert(
      'Excluir Nota Fiscal',
      `Tem certeza que deseja excluir a nota fiscal nº ${item.number}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/invoices/${item.id}`);
              Toast.show({
                type: 'success',
                text1: 'Excluída!',
                text2: 'Nota fiscal removida com sucesso.',
              });
              await fetchInvoices(page);
            } catch (error) {
              console.error('Erro ao excluir nota fiscal:', error);
              Alert.alert('Erro', 'Não foi possível excluir a nota fiscal.');
            }
          },
        },
      ]
    );
  };

  const handleOpenAttachment = (nf_url: string) => {
    // Monta a URL completa do arquivo no storage da API
    let baseUrl = api.defaults.baseURL || '';
    if (baseUrl.endsWith('/api')) {
      baseUrl = baseUrl.replace('/api', '');
    }
    const fullUrl = `${baseUrl}/storage/${nf_url}`;

    Linking.canOpenURL(fullUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(fullUrl);
        } else {
          Alert.alert('Anexo', `Caminho do arquivo: ${fullUrl}`);
        }
      })
      .catch(() => {
        Alert.alert('Anexo', `Caminho do arquivo: ${fullUrl}`);
      });
  };

  // Cálculo do total faturado no ano selecionado
  const totalAmount = invoices.reduce((acc, curr) => acc + Number(curr.value || 0), 0);

  return (
    <View style={styles.container}>
      <Header title="Notas Fiscais 📄" />

      <View style={styles.content}>
        {/* Barra Superior de Ações e Filtro */}
        <View style={styles.topActionsRow}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Feather name="plus-circle" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.addButtonText}>Emitir / Incluir NF</Text>
          </TouchableOpacity>

          <View style={styles.yearFilterWrapper}>
            <DateInput
              placeholder="Ano"
              value={yearFilter}
              onChange={(date) => setYearFilter(date)}
            />
          </View>
        </View>

        {/* Resumo do Ano */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total de NFs</Text>
            <Text style={styles.summaryValue}>{totalCount}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Faturado</Text>
            <Text style={styles.summaryValueHighlight}>{formatCurrency(totalAmount)}</Text>
          </View>
        </View>

        {/* Lista de Notas Fiscais */}
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={invoices}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Feather name="file-text" size={48} color="#ccc" style={{ marginBottom: 12 }} />
                <Text style={styles.emptyTitle}>Nenhuma nota fiscal encontrada</Text>
                <Text style={styles.emptySubtitle}>
                  Clique em &quot;Emitir / Incluir NF&quot; para registrar sua primeira nota.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.invoiceCard}>
                <View style={styles.invoiceHeaderRow}>
                  <View style={styles.numberBadge}>
                    <Text style={styles.numberBadgeText}>NF #{item.number}</Text>
                  </View>
                  <Text style={styles.invoiceValue}>{formatCurrency(Number(item.value))}</Text>
                </View>

                <Text style={styles.invoiceDesc} numberOfLines={2}>
                  {item.description}
                </Text>

                <View style={styles.invoiceFooterRow}>
                  <Text style={styles.invoiceDate}>
                    {item.issue_date
                      ? `Emissão: ${new Date(item.issue_date).toLocaleDateString('pt-BR')}`
                      : ''}
                  </Text>

                  <View style={styles.actionsRight}>
                    {item.nf_url ? (
                      <TouchableOpacity
                        style={styles.attachmentButton}
                        onPress={() => handleOpenAttachment(item.nf_url!)}
                      >
                        <Feather name="paperclip" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                        <Text style={styles.attachmentText}>Ver Anexo</Text>
                      </TouchableOpacity>
                    ) : null}

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteInvoice(item)}
                    >
                      <Feather name="trash-2" size={16} color="#d9534f" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />
        )}

        {/* Paginação */}
        {lastPage > 1 && (
          <View style={styles.paginationRow}>
            <TouchableOpacity
              disabled={page <= 1}
              onPress={() => fetchInvoices(page - 1)}
              style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
            >
              <Text style={styles.pageBtnText}>« Anterior</Text>
            </TouchableOpacity>

            <Text style={styles.pageIndicator}>
              Página {page} de {lastPage}
            </Text>

            <TouchableOpacity
              disabled={page >= lastPage}
              onPress={() => fetchInvoices(page + 1)}
              style={[styles.pageBtn, page >= lastPage && styles.pageBtnDisabled]}
            >
              <Text style={styles.pageBtnText}>Próxima »</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Modal de Cadastro de Nota Fiscal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Nota Fiscal</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color="#555" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Input
                label="Número da Nota *"
                value={number}
                onChangeText={setNumber}
                placeholder="Ex: 00123"
              />

              <Input
                label="Valor (R$) *"
                value={value}
                onChangeText={setValue}
                placeholder="Ex: 1500.00"
                keyboardType="numeric"
              />

              <DateInput
                label="Data de Emissão *"
                value={issueDate}
                onChange={(date) => date && setIssueDate(date)}
              />

              <Input
                label="Descrição dos Serviços / Produtos *"
                value={description}
                onChangeText={setDescription}
                placeholder="Ex: Prestação de serviços de consultoria"
                multiline
                numberOfLines={3}
              />

              <View style={styles.filePickerContainer}>
                <Text style={styles.filePickerLabel}>Anexo (PDF ou XML - Máx 2MB)</Text>
                <TouchableOpacity style={styles.fileButton} onPress={handlePickFile}>
                  <Feather name="upload" size={18} color={colors.primary} style={{ marginRight: 8 }} />
                  <Text style={styles.fileButtonText} numberOfLines={1}>
                    {file ? file.name : 'Selecionar arquivo PDF / XML'}
                  </Text>
                </TouchableOpacity>

                {file && (
                  <TouchableOpacity
                    style={styles.clearFileButton}
                    onPress={() => setFile(null)}
                  >
                    <Text style={styles.clearFileText}>Remover anexo</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Button
                title="Salvar Nota Fiscal"
                onPress={handleCreateInvoice}
                loading={submitting}
                style={{ marginTop: 16 }}
              />

              <Button
                title="Cancelar"
                onPress={() => setModalVisible(false)}
                variant="outline"
                style={{ marginTop: 10, marginBottom: 20 }}
              />
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  topActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  yearFilterWrapper: {
    width: 130,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#eee',
    marginHorizontal: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  summaryValueHighlight: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  listContent: {
    paddingBottom: 20,
  },
  invoiceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  invoiceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  numberBadge: {
    backgroundColor: '#e8f0fe',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  numberBadgeText: {
    color: colors.primaryDark,
    fontWeight: 'bold',
    fontSize: 13,
  },
  invoiceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  invoiceDesc: {
    fontSize: 14,
    color: '#444',
    marginBottom: 10,
    lineHeight: 20,
  },
  invoiceFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  invoiceDate: {
    fontSize: 12,
    color: '#888',
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  attachmentText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 6,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  pageBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pageBtnDisabled: {
    opacity: 0.4,
  },
  pageBtnText: {
    fontSize: 13,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  pageIndicator: {
    fontSize: 13,
    color: '#666',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  filePickerContainer: {
    marginVertical: 10,
  },
  filePickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 14,
  },
  fileButtonText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  clearFileButton: {
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  clearFileText: {
    fontSize: 12,
    color: '#d9534f',
  },
});
