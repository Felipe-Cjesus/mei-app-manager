import Feather from '@expo/vector-icons/Feather';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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
import ToggleType from '../../src/components/ToggleType';
import colors from '../../src/theme/colors';
import { currencyToNumber, maskCurrency } from '../../src/utils/masks';

type ExpenseItem = {
  id: number;
  description: string;
  amount: number;
  date: string;
  type?: 'manual' | 'nota_fiscal';
  document_path?: string | null;
};

export default function ExpenseList() {
  const { activeEnterprise } = useEnterprise();
  const [data, setData] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const router = useRouter();
  const pageTitle = 'Listagem de Despesas';
  const perPage = 10;

  const [nameFilter, setNameFilter] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | null>(null);

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
    return format(date, 'yyyy-MM-dd'); // Formata como "2025-09-21"
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
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState<Date>(new Date());
  const [editType, setEditType] = useState<'manual' | 'nota_fiscal'>('manual');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const fetchExpense = useCallback(async (pageNumber = 1, date = '', description = '') => {
    try {
      setLoading(true);
      const dateFormatted = date;
      const descriptionFormatted = description;
      let dateQuery = '';
      let descriptionQuery = '';
      let lgToast = false;

      if (dateFormatted !== '' && dateFormatted != null) {
        dateQuery = '&date=' + dateFormatted;
        lgToast = true;
      }
      if (descriptionFormatted !== '') {
        descriptionQuery = '&description=' + descriptionFormatted;
        lgToast = true;
      }

      const enterpriseQuery = activeEnterprise?.id ? `&enterprise_id=${activeEnterprise.id}` : '';
      const response = await api.get(`/expenses?page=${pageNumber}&perPage=${perPage}` + dateQuery + descriptionQuery + enterpriseQuery);
      const items: ExpenseItem[] = response.data.data.data;
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
      console.error('Erro ao carregar despesas:', error);
    } finally {
      setLoading(false);
    }
  }, [activeEnterprise?.id, perPage]);

  useEffect(() => {
    fetchExpense(1);
  }, [fetchExpense]);

  const handleOpenEdit = (item: ExpenseItem) => {
    setEditingItem(item);
    setEditDescription(item.description);
    setEditAmount(maskCurrency(item.amount));
    setEditDate(new Date(item.date));
    setEditType(item.type === 'nota_fiscal' ? 'nota_fiscal' : 'manual');
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    if (!editDescription.trim() || !editAmount.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Campos obrigatórios',
        text2: 'Preencha a descrição e o valor.',
      });
      return;
    }

    try {
      setSubmittingEdit(true);
      await api.put(`/expenses/${editingItem.id}`, {
        description: editDescription.trim(),
        amount: currencyToNumber(editAmount),
        date: formatDateToDatabase(editDate),
        type: editType,
      });

      Toast.show({
        type: 'success',
        text1: 'Sucesso!',
        text2: 'Despesa atualizada com sucesso ✅',
      });
      setEditModalVisible(false);
      setEditingItem(null);
      fetchExpense(page, formatDateToDatabase(dateFilter), nameFilter);
    } catch (error) {
      console.error('Erro ao atualizar despesa:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível atualizar a despesa.',
      });
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Excluir Despesa',
      'Tem certeza de que deseja excluir este lançamento de despesa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/expenses/${id}`);
              Toast.show({
                type: 'success',
                text1: 'Excluído!',
                text2: 'Despesa excluída com sucesso ✅',
              });
              fetchExpense(page, formatDateToDatabase(dateFilter), nameFilter);
            } catch (error) {
              console.error('Erro ao excluir despesa:', error);
              Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: 'Não foi possível excluir a despesa.',
              });
            }
          },
        },
      ]
    );
  };

  const handlePageChange = (targetPage: number) => {
    if (targetPage >= 1 && targetPage <= lastPage && targetPage !== page) {
      fetchExpense(targetPage);
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
      <Header title={pageTitle} showBackButton onBack={() => router.push('/Finance')} />
      <View style={styles.content}>
        {/* <View style={styles.filterContainer}> */}
        <Input
            placeholder="Filtrar por Descrição..."
            value={nameFilter}
            onChangeText={setNameFilter}
        />
        
        <DateInput
            value={dateFilter}
            onChange={(selectedDate) => {
                if (selectedDate) setDateFilter(selectedDate);
            }}
        />
        {/* </View> */}
        <Button title="Filtrar" onPress={() => fetchExpense(1, formatDateToDatabase(dateFilter), nameFilter)} style={styles.filterButton}/>
        
        <Text style={styles.title}>Despesas</Text>

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
                    <Text style={styles.desc} numberOfLines={1}>
                      {item.description}
                    </Text>

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

                  <View style={styles.itemFooterRow}>
                    <Text style={styles.date}>
                      {new Date(item.date).toLocaleDateString()}
                    </Text>

                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>
                        {item.type === 'nota_fiscal' ? 'Nota Fiscal' : 'Manual'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            />
            <View style={styles.paginationContainer}>
              {renderPagination()}
            </View>
          </>
        )}

        {/* Modal de Edição de Despesa */}
        <Modal
          visible={editModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Editar Despesa</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <Feather name="x" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
                <Input
                  label="Descrição *"
                  value={editDescription}
                  onChangeText={setEditDescription}
                  placeholder="Ex: Fornecedor de insumos"
                />

                <Input
                  label="Valor (R$) *"
                  value={editAmount}
                  onChangeText={(text) => setEditAmount(maskCurrency(text))}
                  placeholder="R$ 0,00"
                  keyboardType="numeric"
                />

                <DateInput
                  label="Data da Despesa *"
                  value={editDate}
                  onChange={(d) => d && setEditDate(d)}
                />

                <ToggleType value={editType} onChange={setEditType} />

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
  itemFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  typeBadge: {
    backgroundColor: '#eef6ff',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  typeBadgeText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
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
    color: '#2979FF',
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  statusPending: {
    fontSize: 12,
    color: '#ff0000',
    marginTop: 2,
  },
  statusReceived: {
    fontSize: 12,
    color: '#00B066',
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
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginBottom: 8,
  },
});