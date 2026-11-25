import Feather from '@expo/vector-icons/Feather';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
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
import TogglePaymentStatus from '../../src/components/TogglePaymentStatus';
import colors from '../../src/theme/colors';
import { currencyToNumber, maskCurrency, maskReference } from '../../src/utils/masks';

type DasPaymentItem = {
  id: number;
  reference: string;
  amount: number;
  payment_date: string;
  due_date: string;
  status: string;
};

export default function DasPaymentList() {
  const { activeEnterprise } = useEnterprise();
  const [data, setData] = useState<DasPaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const router = useRouter();
  const pageTitle = 'Listagem de Guias DAS';
  const perPage = 10;

  const [nameFilter, setNameFilter] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | null>(null);

  const arrayStatus: { [key: string]: string } = {
    'pending': 'Pendente',
    'paid'   : 'Pago',
    'exempt' : 'Isento',
    'overdue': 'Vencido'
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDateToDatabase = (dateString: any) => {
    if (
      dateString === '' ||
      dateString === null ||
      dateString === '1969-12-31' ||
      dateString === '1970-01-01'
    ) {
      return '';
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return format(date, 'yyyy');
  };

  const getPaginationPages = (current: number, total: number, maxVisible: number = 3) => {
    const pages: (number | string)[] = [];
  
    if (total <= maxVisible) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      const middle = Math.floor(maxVisible / 2);
      let start = current - middle;
      let end = current + middle;
  
      if (start < 1) {
        start = 1;
        end = maxVisible;
      } else if (end > total) {
        end = total;
        start = total - maxVisible + 1;
      }
  
      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }
  
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
  
      if (end < total) {
        if (end < total - 1) pages.push('...');
        pages.push(total);
      }
    }
  
    return pages;
  };

  // Estados para edição
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<DasPaymentItem | null>(null);
  const [editReference, setEditReference] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDueDate, setEditDueDate] = useState<Date>(new Date());
  const [editPaymentDate, setEditPaymentDate] = useState<Date | null>(null);
  const [editStatus, setEditStatus] = useState<'paid' | 'pending' | 'exempt' | 'overdue'>('pending');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const fetchDasPayment = useCallback(async (pageNumber = 1, year = '', reference = '') => {
    try {
      setLoading(true);

      let queryParams = '';
      let lgToast = false;

      if (year && year !== '') {
        queryParams += '&year=' + encodeURIComponent(year);
        lgToast = true;
      }
      if (reference && reference.trim() !== '') {
        queryParams += '&reference=' + encodeURIComponent(reference.trim());
        lgToast = true;
      }
      if (activeEnterprise?.id) {
        queryParams += '&enterprise_id=' + encodeURIComponent(activeEnterprise.id);
      }

      const response = await api.get(`/das-payments?page=${pageNumber}&perPage=${perPage}` + queryParams);

      const items: DasPaymentItem[] = response.data.data.data;
      const currentPage = response.data.data.current_page;
      const last = response.data.data.last_page;

      setData(items);
      setPage(currentPage);
      setLastPage(last);

      if (lgToast) {
        Toast.show({
          type: 'success',
          text1: 'Sucesso!',
          text2: 'Listagem atualizada com sucesso ✅',
        });
      }
    } catch (error) {
      console.error('Erro ao carregar guias DAS:', error);
    } finally {
      setLoading(false);
    }
  }, [activeEnterprise?.id, perPage]);

  useEffect(() => {
    fetchDasPayment(1);
  }, [fetchDasPayment]);

  const handleOpenEdit = (item: DasPaymentItem) => {
    setEditingItem(item);
    setEditReference(maskReference(item.reference));
    setEditAmount(maskCurrency(item.amount));
    setEditDueDate(new Date(item.due_date));
    setEditPaymentDate(item.payment_date ? new Date(item.payment_date) : null);
    setEditStatus(
      (item.status as 'paid' | 'pending' | 'exempt' | 'overdue') || 'pending'
    );
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    if (!editReference.trim() || !editAmount.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Campos obrigatórios',
        text2: 'Preencha a referência e o valor da guia.',
      });
      return;
    }

    try {
      setSubmittingEdit(true);
      await api.put(`/das-payments/${editingItem.id}`, {
        reference: editReference.trim(),
        amount: currencyToNumber(editAmount),
        due_date: formatDateToDatabase(editDueDate),
        payment_date: editPaymentDate ? formatDateToDatabase(editPaymentDate) : null,
        status: editStatus,
      });

      Toast.show({
        type: 'success',
        text1: 'Sucesso!',
        text2: 'Guia DAS atualizada com sucesso ✅',
      });
      setEditModalVisible(false);
      setEditingItem(null);
      fetchDasPayment(page, formatDateToDatabase(dateFilter), nameFilter);
    } catch (error) {
      console.error('Erro ao atualizar guia DAS:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível atualizar a guia DAS.',
      });
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Excluir Guia DAS',
      'Tem certeza de que deseja excluir esta guia DAS?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/das-payments/${id}`);
              Toast.show({
                type: 'success',
                text1: 'Excluído!',
                text2: 'Guia DAS excluída com sucesso ✅',
              });
              fetchDasPayment(page, formatDateToDatabase(dateFilter), nameFilter);
            } catch (error) {
              console.error('Erro ao excluir guia DAS:', error);
              Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: 'Não foi possível excluir a guia DAS.',
              });
            }
          },
        },
      ]
    );
  };

  const handlePageChange = (targetPage: number) => {
    if (targetPage >= 1 && targetPage <= lastPage && targetPage !== page) {
      fetchDasPayment(targetPage);
    }
  };

  const renderPagination = () => {
    const pagesToShow = getPaginationPages(page, lastPage, 3);
  
    return (
      // <ScrollView horizontal contentContainerStyle={styles.paginationContainer}>
      <View style={styles.paginationContainer}>
        <TouchableOpacity onPress={() => handlePageChange(1)} style={styles.pageButton}>
          <Text style={styles.pageButtonText}>« Primeira</Text>
        </TouchableOpacity>
  
        {pagesToShow.map((pg, index) => {
          if (pg === '...') {
            return (
              <Text key={`dots-${index}`} style={{ marginHorizontal: 6, fontSize: 18 }}>
                ...
              </Text>
            );
          }
  
          return (
            <TouchableOpacity
              key={`page-${pg}`}
              onPress={() => handlePageChange(Number(pg))}
              style={[
                styles.pageNumber,
                pg === page && styles.pageNumberActive,
              ]}
            >
              <Text style={pg === page ? styles.pageNumberTextActive : styles.pageNumberText}>
                {pg}
              </Text>
            </TouchableOpacity>
          );
        })}
  
        <TouchableOpacity onPress={() => handlePageChange(lastPage)} style={styles.pageButton}>
          <Text style={styles.pageButtonText}>Última »</Text>
        </TouchableOpacity>
      {/* </ScrollView> */}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title={pageTitle} />
      <View style={styles.content}>

        <Input
          placeholder="Filtrar por Referência (Ex: 05/2025)..."
          value={nameFilter}
          onChangeText={setNameFilter}
        />
        
        <DateInput
          placeholder="Filtrar por ano"
          value={dateFilter}
          onChange={(selectedDate) => {
            if (selectedDate) setDateFilter(selectedDate);
          }}
        />
        <Button
          title="Filtrar"
          onPress={() => fetchDasPayment(1, formatDateToDatabase(dateFilter), nameFilter)}
          style={styles.filterButton}
        />

        <Text style={styles.title}>Guias DAS</Text>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primaryDark} />
        ) : (
          <>
            <FlatList
              data={data}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.item}>
                  <View style={styles.itemHeaderRow}>
                    <Text style={styles.desc}>{'Ref: ' + item.reference}</Text>

                    {/* Botões de Ação: Editar e Excluir */}
                    <View style={styles.itemActions}>
                      <TouchableOpacity
                        style={styles.actionIconButton}
                        onPress={() => handleOpenEdit(item)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Feather name="edit-2" size={16} color={colors.primary} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionIconButton}
                        onPress={() => handleDelete(item.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Feather name="trash-2" size={16} color="#e74c3c" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
                  
                  <View style={{ marginTop: 4 }}>
                    <Text style={styles.date}>
                      {item.payment_date ? 'Pagamento: ' + new Date(item.payment_date).toLocaleDateString() : 'Pagamento: Pendente'}
                    </Text>
                    <Text style={styles.date}>
                      {'Vencimento: ' + new Date(item.due_date).toLocaleDateString()}
                    </Text>
                  </View>

                  <View style={{ marginTop: 6 }}>
                    {item.status === 'overdue' ? (
                      <Text style={styles.statusOverdue}>
                        {arrayStatus[item.status]}
                      </Text>
                    ) : item.status === 'paid' ? (
                      <Text style={styles.statusPaid}>
                        {arrayStatus[item.status]}
                      </Text>
                    ) : item.status === 'pending' ? (
                      <Text style={styles.statusPending}>
                        {arrayStatus[item.status]}
                      </Text>
                    ) : (
                      <Text style={styles.date}>
                        {arrayStatus[item.status]}
                      </Text>
                    )}
                  </View>
                </View>
              )}
            />
            <View style={styles.paginationContainer}>
              {renderPagination()}
            </View>
          </>
        )}

        <Button
          title="Voltar"
          onPress={() => router.push('/Finance')}
          style={{ marginTop: 16 }}
        />

        {/* Modal de Edição de Guia DAS */}
        <Modal
          visible={editModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Editar Guia DAS</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <Feather name="x" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 440 }} showsVerticalScrollIndicator={false}>
                <Input
                  label="Referência (MM/AAAA) *"
                  value={editReference}
                  onChangeText={(text) => setEditReference(maskReference(text))}
                  placeholder="Ex: 05/2026"
                  keyboardType="numeric"
                  maxLength={7}
                />

                <Input
                  label="Valor (R$) *"
                  value={editAmount}
                  onChangeText={(text) => setEditAmount(maskCurrency(text))}
                  placeholder="R$ 0,00"
                  keyboardType="numeric"
                />

                <DateInput
                  label="Data de Vencimento *"
                  value={editDueDate}
                  onChange={(d) => d && setEditDueDate(d)}
                />

                <DateInput
                  label="Data de Pagamento (opcional)"
                  value={editPaymentDate || new Date()}
                  onChange={setEditPaymentDate}
                />

                <TogglePaymentStatus value={editStatus} onChange={setEditStatus} />

                <View style={styles.modalActions}>
                  <Button
                    title="Cancelar"
                    variant="outline"
                    onPress={() => setEditModalVisible(false)}
                    style={{ flex: 1, marginRight: 8 }}
                  />
                  <Button
                    title={submittingEdit ? 'Salvando...' : 'Salvar'}
                    onPress={handleSaveEdit}
                    disabled={submittingEdit}
                    style={{ flex: 1 }}
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 16,
  },
  item: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconButton: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: '#f5f7fa',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 16,
  },
  desc: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  amount: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  statusOverdue: {
    fontSize: 12,
    color: '#ff0000',
    marginTop: 2,
  },
  statusPaid: {
    fontSize: 12,
    color: '#00B066',
    marginTop: 2,
  },
  statusPending: {
    fontSize: 12,
    color: '#E88700',
    marginTop: 2,
  },
  paginationContainer: {
    // padding: 2,
    flexDirection: 'row',
    marginTop: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'nowrap',
    // backgroundColor: '#e0e0e0',
  },
  pageNumber: {
    backgroundColor: colors.border,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  pageNumberActive: {
    backgroundColor: colors.primaryDark,
  },
  pageNumberText: {
    color: '#333',
    fontWeight: '600',
  },
  pageNumberTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  pageButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  pageButtonText: {
    color: colors.primaryDark,
    fontWeight: '600',
  },
  filterButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginBottom: 8,
  },
});