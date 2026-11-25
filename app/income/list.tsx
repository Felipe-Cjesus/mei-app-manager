import Feather from '@expo/vector-icons/Feather';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
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
import DateInput from '../../src/components/DateInput';
import Header from '../../src/components/HeaderSecundary';
import Input from '../../src/components/Input';
import ToggleRecebido from '../../src/components/ToggleRecebido';
import colors from '../../src/theme/colors';
import { currencyToNumber, maskCurrency } from '../../src/utils/masks';

type IncomeItem = {
  id: number;
  description: string;
  amount: number;
  date: string;
  received: boolean;
};

export default function IncomeList() {
  const { activeEnterprise } = useEnterprise();
  const [data, setData] = useState<IncomeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const router = useRouter();
  const perPage = 10;

  // Filtros
  const [nameFilter, setNameFilter] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDateToDatabase = (dateString: any) => {
    if (!dateString || dateString === '1969-12-31' || dateString === '1970-01-01') {
      return '';
    }
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return format(d, 'yyyy-MM-dd');
  };

  // Estados para edição
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<IncomeItem | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState<Date>(new Date());
  const [editReceived, setEditReceived] = useState(false);
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const fetchIncome = useCallback(async (pageNumber = 1, date = '', description = '') => {
    try {
      setLoading(true);
      let query = `?page=${pageNumber}&perPage=${perPage}`;

      if (date) {
        query += `&date=${encodeURIComponent(date)}`;
      }
      if (description.trim()) {
        query += `&description=${encodeURIComponent(description.trim())}`;
      }
      if (activeEnterprise?.id) {
        query += `&enterprise_id=${activeEnterprise.id}`;
      }

      const response = await api.get(`/incomes${query}`);
      const paginated = response.data?.data;

      if (paginated) {
        setData(paginated.data || []);
        setPage(paginated.current_page || 1);
        setLastPage(paginated.last_page || 1);
        setTotalCount(paginated.total || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar',
        text2: 'Não foi possível buscar as receitas.',
      });
    } finally {
      setLoading(false);
    }
  }, [activeEnterprise?.id]);

  useEffect(() => {
    fetchIncome(1);
  }, [fetchIncome]);

  const handleApplyFilter = () => {
    fetchIncome(1, formatDateToDatabase(dateFilter), nameFilter);
  };

  const handleClearFilter = () => {
    setNameFilter('');
    setDateFilter(null);
    fetchIncome(1, '', '');
  };

  const handleOpenEdit = (item: IncomeItem) => {
    setEditingItem(item);
    setEditDescription(item.description);
    setEditAmount(maskCurrency(item.amount));
    setEditDate(new Date(item.date));
    setEditReceived(Boolean(item.received));
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    if (!editDescription.trim() || !editAmount.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Campos Obrigatórios',
        text2: 'Preencha a descrição e o valor da receita.',
      });
      return;
    }

    try {
      setSubmittingEdit(true);
      await api.put(`/incomes/${editingItem.id}`, {
        description: editDescription.trim(),
        amount: currencyToNumber(editAmount),
        date: formatDateToDatabase(editDate),
        received: editReceived,
      });

      Toast.show({
        type: 'success',
        text1: 'Atualizado!',
        text2: 'Receita atualizada com sucesso ✅',
      });
      setEditModalVisible(false);
      setEditingItem(null);
      fetchIncome(page, formatDateToDatabase(dateFilter), nameFilter);
    } catch (error) {
      console.error('Erro ao atualizar receita:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível atualizar a receita.',
      });
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Excluir Receita',
      'Tem certeza de que deseja excluir este lançamento de receita?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/incomes/${id}`);
              Toast.show({
                type: 'success',
                text1: 'Excluído!',
                text2: 'Receita excluída com sucesso ✅',
              });
              fetchIncome(page, formatDateToDatabase(dateFilter), nameFilter);
            } catch (error) {
              console.error('Erro ao excluir receita:', error);
              Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: 'Não foi possível excluir a receita.',
              });
            }
          },
        },
      ]
    );
  };

  const isFiltering = Boolean(nameFilter || dateFilter);

  return (
    <View style={styles.container}>
      <Header title="Receitas" showBackButton onBack={() => router.push('/Finance')} />

      <View style={styles.content}>
        {/* Barra Superior com Contagem e Botão Novo */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.screenHeading}>Extrato de Receitas</Text>
            <Text style={styles.counterText}>
              {totalCount} {totalCount === 1 ? 'lançamento' : 'lançamentos'}
            </Text>
          </View>

          <View style={styles.topActions}>
            <TouchableOpacity
              style={[styles.filterToggleBtn, (filtersOpen || isFiltering) && styles.filterToggleActive]}
              activeOpacity={0.8}
              onPress={() => setFiltersOpen(!filtersOpen)}
            >
              <Feather
                name="filter"
                size={16}
                color={filtersOpen || isFiltering ? '#10b981' : '#64748b'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.newButton}
              activeOpacity={0.85}
              onPress={() => router.push('/income/create')}
            >
              <Feather name="plus" size={16} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.newButtonText}>Nova</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Painel Expansível de Filtros */}
        {filtersOpen && (
          <View style={styles.filterCard}>
            <Input
              placeholder="Buscar por descrição..."
              value={nameFilter}
              onChangeText={setNameFilter}
            />

            <DateInput
              placeholder="Data específica"
              value={dateFilter}
              onChange={(selectedDate) => setDateFilter(selectedDate)}
            />

            <View style={styles.filterButtonsRow}>
              {isFiltering && (
                <TouchableOpacity
                  style={styles.clearFilterBtn}
                  activeOpacity={0.7}
                  onPress={handleClearFilter}
                >
                  <Text style={styles.clearFilterText}>Limpar</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.applyFilterBtn}
                activeOpacity={0.85}
                onPress={handleApplyFilter}
              >
                <Feather name="search" size={14} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.applyFilterText}>Aplicar Filtro</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Lista de Receitas */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10b981" />
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Feather name="arrow-down-left" size={32} color="#10b981" />
                </View>
                <Text style={styles.emptyTitle}>Nenhuma receita encontrada</Text>
                <Text style={styles.emptySubtitle}>
                  {isFiltering
                    ? 'Tente ajustar os filtros de busca para encontrar registros.'
                    : 'Cadastre sua primeira receita para iniciar o acompanhamento financeiro.'}
                </Text>
                {!isFiltering && (
                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() => router.push('/income/create')}
                  >
                    <Feather name="plus-circle" size={16} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.emptyButtonText}>Cadastrar Receita</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.cardItem}>
                {/* Faixa lateral indicativa verde */}
                <View style={styles.cardAccentBar} />

                <View style={styles.cardBody}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardDescription} numberOfLines={1}>
                      {item.description}
                    </Text>

                    <View style={styles.actionButtonsRow}>
                      <TouchableOpacity
                        style={styles.actionCircleBtn}
                        activeOpacity={0.7}
                        onPress={() => handleOpenEdit(item)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Feather name="edit-2" size={15} color={colors.primary} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionCircleBtn, { backgroundColor: '#fee2e2' }]}
                        activeOpacity={0.7}
                        onPress={() => handleDelete(item.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Feather name="trash-2" size={15} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={styles.cardAmount}>
                    + {formatCurrency(item.amount)}
                  </Text>

                  <View style={styles.cardFooterRow}>
                    <View style={styles.dateRow}>
                      <Feather name="calendar" size={13} color="#94a3b8" style={{ marginRight: 5 }} />
                      <Text style={styles.cardDate}>
                        {new Date(item.date).toLocaleDateString('pt-BR')}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        item.received ? styles.statusReceivedBadge : styles.statusPendingBadge,
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: item.received ? '#10b981' : '#f59e0b' },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusBadgeText,
                          item.received ? styles.statusReceivedText : styles.statusPendingText,
                        ]}
                      >
                        {item.received ? 'Recebido' : 'Pendente'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          />
        )}

        {/* Paginação */}
        {lastPage > 1 && (
          <View style={styles.paginationBar}>
            <TouchableOpacity
              disabled={page <= 1}
              onPress={() => fetchIncome(page - 1, formatDateToDatabase(dateFilter), nameFilter)}
              style={[styles.pageNavBtn, page <= 1 && styles.pageNavBtnDisabled]}
            >
              <Feather name="chevron-left" size={18} color={page <= 1 ? '#cbd5e1' : '#1e293b'} />
              <Text style={[styles.pageNavText, page <= 1 && styles.pageNavTextDisabled]}>Anterior</Text>
            </TouchableOpacity>

            <Text style={styles.pageIndicatorText}>
              Página <Text style={{ fontWeight: '700', color: '#0f172a' }}>{page}</Text> de {lastPage}
            </Text>

            <TouchableOpacity
              disabled={page >= lastPage}
              onPress={() => fetchIncome(page + 1, formatDateToDatabase(dateFilter), nameFilter)}
              style={[styles.pageNavBtn, page >= lastPage && styles.pageNavBtnDisabled]}
            >
              <Text style={[styles.pageNavText, page >= lastPage && styles.pageNavTextDisabled]}>Próxima</Text>
              <Feather name="chevron-right" size={18} color={page >= lastPage ? '#cbd5e1' : '#1e293b'} />
            </TouchableOpacity>
          </View>
        )}

        {/* Modal de Edição */}
        <Modal
          visible={editModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setEditModalVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setEditModalVisible(false)}>
            <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Editar Receita</Text>
                  <Text style={styles.modalSubtitle}>Altere os detalhes do lançamento</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setEditModalVisible(false)}
                  style={styles.modalCloseBtn}
                >
                  <Feather name="x" size={20} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Input
                  label="Descrição *"
                  value={editDescription}
                  onChangeText={setEditDescription}
                  placeholder="Ex: Consultoria MEI"
                />

                <Input
                  label="Valor (R$) *"
                  value={editAmount}
                  onChangeText={(text) => setEditAmount(maskCurrency(text))}
                  placeholder="R$ 0,00"
                  keyboardType="numeric"
                />

                <DateInput
                  label="Data de Recebimento *"
                  value={editDate}
                  onChange={(d) => d && setEditDate(d)}
                />

                <ToggleRecebido value={editReceived} onChange={setEditReceived} />

                <View style={styles.modalActionsRow}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setEditModalVisible(false)}
                  >
                    <Text style={styles.modalCancelText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalSaveBtn, submittingEdit && { opacity: 0.7 }]}
                    onPress={handleSaveEdit}
                    disabled={submittingEdit}
                  >
                    {submittingEdit ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.modalSaveText}>Salvar Alterações</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  // Barra Superior
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  screenHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  counterText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterToggleBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterToggleActive: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  newButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },

  // Painel de Filtros
  filterCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  filterButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  clearFilterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  clearFilterText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  applyFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  applyFilterText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  // Listagem
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  listContent: {
    paddingBottom: 24,
  },
  cardItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1.5,
  },
  cardAccentBar: {
    width: 5,
    backgroundColor: '#10b981',
  },
  cardBody: {
    flex: 1,
    padding: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDescription: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    marginRight: 10,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionCircleBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardAmount: {
    fontSize: 17,
    fontWeight: '800',
    color: '#059669',
    marginTop: 4,
    marginBottom: 8,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardDate: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusReceivedBadge: {
    backgroundColor: '#dcfce7',
  },
  statusPendingBadge: {
    backgroundColor: '#fef3c7',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusReceivedText: {
    color: '#15803d',
  },
  statusPendingText: {
    color: '#b45309',
  },

  // Estado Vazio
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },

  // Paginação
  paginationBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  pageNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  pageNavBtnDisabled: {
    opacity: 0.4,
  },
  pageNavText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  pageNavTextDisabled: {
    color: '#94a3b8',
  },
  pageIndicatorText: {
    fontSize: 13,
    color: '#64748b',
  },

  // Modal de Edição
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  modalSaveBtn: {
    flex: 1.3,
    backgroundColor: '#10b981',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
