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
import TogglePaymentStatus, { StatusType } from '../../src/components/TogglePaymentStatus';
import colors from '../../src/theme/colors';
import { currencyToNumber, maskCurrency, maskReference } from '../../src/utils/masks';

type DasPaymentItem = {
  id: number;
  reference: string;
  amount: number;
  payment_date: string | null;
  due_date: string;
  status: string;
};

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  paid: {
    label: 'Pago',
    bg: '#dcfce7',
    text: '#15803d',
    dot: '#10b981',
  },
  pending: {
    label: 'Pendente',
    bg: '#fef3c7',
    text: '#b45309',
    dot: '#f59e0b',
  },
  overdue: {
    label: 'Vencido',
    bg: '#fee2e2',
    text: '#b91c1c',
    dot: '#ef4444',
  },
  exempt: {
    label: 'Isento',
    bg: '#dbeafe',
    text: '#1d4ed8',
    dot: '#2563eb',
  },
};

export default function DasPaymentList() {
  const { activeEnterprise } = useEnterprise();
  const [data, setData] = useState<DasPaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const router = useRouter();
  const perPage = 10;

  // Filtros
  const [referenceFilter, setReferenceFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
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
  const [editingItem, setEditingItem] = useState<DasPaymentItem | null>(null);
  const [editReference, setEditReference] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDueDate, setEditDueDate] = useState<Date>(new Date());
  const [editPaymentDate, setEditPaymentDate] = useState<Date | null>(null);
  const [editStatus, setEditStatus] = useState<StatusType>('pending');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const fetchDasPayment = useCallback(async (pageNumber = 1, year = '', reference = '') => {
    try {
      setLoading(true);
      let query = `?page=${pageNumber}&perPage=${perPage}`;

      if (year.trim()) {
        query += `&year=${encodeURIComponent(year.trim())}`;
      }
      if (activeEnterprise?.id) {
        query += `&enterprise_id=${activeEnterprise.id}`;
      }

      const response = await api.get(`/das-payments${query}`);
      const paginated = response.data?.data;

      if (paginated) {
        setData(paginated.data || []);
        setPage(paginated.current_page || 1);
        setLastPage(paginated.last_page || 1);
        setTotalCount(paginated.total || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar guias DAS:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar',
        text2: 'Não foi possível buscar as guias DAS.',
      });
    } finally {
      setLoading(false);
    }
  }, [activeEnterprise?.id]);

  useEffect(() => {
    fetchDasPayment(1);
  }, [fetchDasPayment]);

  const handleApplyFilter = () => {
    fetchDasPayment(1, yearFilter, referenceFilter);
  };

  const handleClearFilter = () => {
    setReferenceFilter('');
    setYearFilter('');
    fetchDasPayment(1, '', '');
  };

  const handleOpenEdit = (item: DasPaymentItem) => {
    setEditingItem(item);
    setEditReference(maskReference(item.reference));
    setEditAmount(maskCurrency(item.amount));
    setEditDueDate(new Date(item.due_date));
    setEditPaymentDate(item.payment_date ? new Date(item.payment_date) : null);
    setEditStatus((item.status as StatusType) || 'pending');
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    if (!editReference.trim() || !editAmount.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Campos Obrigatórios',
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
        text1: 'Atualizado!',
        text2: 'Guia DAS atualizada com sucesso ✅',
      });
      setEditModalVisible(false);
      setEditingItem(null);
      fetchDasPayment(page, yearFilter, referenceFilter);
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
              fetchDasPayment(page, yearFilter, referenceFilter);
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

  const isFiltering = Boolean(referenceFilter.trim() || yearFilter.trim());

  return (
    <View style={styles.container}>
      <Header title="Guias DAS" showBackButton onBack={() => router.push('/Finance')} />

      <View style={styles.content}>
        {/* Barra Superior */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.screenHeading}>Histórico de Guias DAS</Text>
            <Text style={styles.counterText}>
              {totalCount} {totalCount === 1 ? 'guia cadastrada' : 'guias cadastradas'}
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
                color={filtersOpen || isFiltering ? '#2563eb' : '#64748b'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.newButton}
              activeOpacity={0.85}
              onPress={() => router.push('/das/create')}
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
              label="Filtrar por Mês/Ano (MM/AAAA)"
              placeholder="Ex: 05/2026"
              value={referenceFilter}
              onChangeText={(text) => setReferenceFilter(maskReference(text))}
              keyboardType="numeric"
              maxLength={7}
            />

            <Input
              label="Ou filtrar por Ano"
              placeholder="Ex: 2026"
              value={yearFilter}
              onChangeText={setYearFilter}
              keyboardType="numeric"
              maxLength={4}
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

        {/* Lista de Guias DAS */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
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
                  <Feather name="file-text" size={32} color="#2563eb" />
                </View>
                <Text style={styles.emptyTitle}>Nenhuma guia DAS encontrada</Text>
                <Text style={styles.emptySubtitle}>
                  {isFiltering
                    ? 'Tente alterar os termos de busca da competência/ano.'
                    : 'Cadastre sua guia DAS mensal para acompanhar os vencimentos do Simples Nacional.'}
                </Text>
                {!isFiltering && (
                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() => router.push('/das/create')}
                  >
                    <Feather name="plus-circle" size={16} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.emptyButtonText}>Registrar Guia DAS</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
            renderItem={({ item }) => {
              const currentStatus = statusConfig[item.status] || statusConfig.pending;

              return (
                <View style={styles.cardItem}>
                  {/* Faixa lateral indicativa azul */}
                  <View style={styles.cardAccentBar} />

                  <View style={styles.cardBody}>
                    <View style={styles.cardHeaderRow}>
                      <View style={styles.referenceBadge}>
                        <Feather name="calendar" size={13} color="#2563eb" style={{ marginRight: 5 }} />
                        <Text style={styles.referenceBadgeText}>
                          Competência: {item.reference}
                        </Text>
                      </View>

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
                      {formatCurrency(item.amount)}
                    </Text>

                    <View style={styles.cardFooterRow}>
                      <View style={styles.datesColumn}>
                        <Text style={styles.dueDateText}>
                          Vencimento: {new Date(item.due_date).toLocaleDateString('pt-BR')}
                        </Text>
                        {item.payment_date && (
                          <Text style={styles.paymentDateText}>
                            Pago em: {new Date(item.payment_date).toLocaleDateString('pt-BR')}
                          </Text>
                        )}
                      </View>

                      <View style={[styles.statusBadge, { backgroundColor: currentStatus.bg }]}>
                        <View style={[styles.statusDot, { backgroundColor: currentStatus.dot }]} />
                        <Text style={[styles.statusBadgeText, { color: currentStatus.text }]}>
                          {currentStatus.label}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            }}
          />
        )}

        {/* Paginação */}
        {lastPage > 1 && (
          <View style={styles.paginationBar}>
            <TouchableOpacity
              disabled={page <= 1}
              onPress={() => fetchDasPayment(page - 1, yearFilter, referenceFilter)}
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
              onPress={() => fetchDasPayment(page + 1, yearFilter, referenceFilter)}
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
                  <Text style={styles.modalTitle}>Editar Guia DAS</Text>
                  <Text style={styles.modalSubtitle}>Atualize dados de vencimento ou quitação</Text>
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
                  label="Referência (MM/AAAA) *"
                  value={editReference}
                  onChangeText={(t) => setEditReference(maskReference(t))}
                  placeholder="Ex: 05/2026"
                  keyboardType="numeric"
                  maxLength={7}
                />

                <Input
                  label="Valor da Guia (R$) *"
                  value={editAmount}
                  onChangeText={(t) => setEditAmount(maskCurrency(t))}
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
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    shadowColor: '#2563eb',
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
    backgroundColor: '#2563eb',
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
    backgroundColor: '#2563eb',
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
  referenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  referenceBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1d4ed8',
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
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 8,
    marginBottom: 8,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  datesColumn: {
    gap: 2,
  },
  dueDateText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  paymentDateText: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
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
    backgroundColor: '#eff6ff',
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
    backgroundColor: '#2563eb',
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
    backgroundColor: '#2563eb',
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
