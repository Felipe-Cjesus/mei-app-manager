// app/(tabs)/Chart.tsx
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../contexts/AuthContext';
import { useEnterprise } from '../../contexts/EnterpriseContext';
import api from '../../services/api';
import Header from '../../src/components/Header';
import colors from '../../src/theme/colors';
import Sidebar from '../Sidebar';

interface MonthData {
  month: string; // '01'..'12'
  invoice_monthly_total: number;
  invoice_monthly_quantity: number;
  income_monthly_total: number;
  income_monthly_quantity: number;
  income_monthly_total_pending: number;
  income_monthly_quantity_pending: number;
  expense_monthly_total: number;
  expense_monthly_quantity: number;
  daspayment_monthly_total: number;
  das_monthly_quantity: number;
  balance: number;
}

interface ReportTotal {
  invoice_total: number;
  invoice_quantity: number;
  income_total: number;
  income_quantity: number;
  income_total_pending: number;
  income_quantity_pending: number;
  expense_total: number;
  expense_quantity: number;
  daspayment_total: number;
  das_quantity: number;
  balance: number;
}

const MONTH_NAMES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

const screenWidth = Dimensions.get('window').width;

export default function Chart() {
  const router = useRouter();
  const { logout } = useAuth();
  const { activeEnterprise } = useEnterprise();

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [months, setMonths] = useState<MonthData[]>([]);
  const [total, setTotal] = useState<ReportTotal | null>(null);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(new Date().getMonth());

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val || 0);
  };

  const fetchReport = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params: string[] = [`year=${selectedYear}`];
      if (activeEnterprise?.id) {
        params.push(`enterprise_id=${activeEnterprise.id}`);
      }

      const response = await api.get(`/reports/monthly?${params.join('&')}`);
      const data = response.data?.data;

      if (data) {
        setMonths(data.months || []);
        setTotal(data.total || null);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível carregar os gráficos financeiros.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedYear, activeEnterprise?.id]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Cálculo da altura máxima para escala das barras
  const maxIncomeOrExpense = Math.max(
    1,
    ...months.map((m) =>
      Math.max(
        Number(m.income_monthly_total) || 0,
        (Number(m.expense_monthly_total) || 0) + (Number(m.daspayment_monthly_total) || 0)
      )
    )
  );

  const selectedMonthData = months[selectedMonthIndex] || null;

  // Indicador de rentabilidade
  const profitMargin =
    total && total.income_total > 0
      ? ((total.balance / total.income_total) * 100).toFixed(1)
      : '0.0';

  return (
    <View style={styles.container}>
      <Header
        onNotificationPress={() => router.push('/Notification')}
        onSettingsPress={() => setSidebarVisible(true)}
      />

      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        onAccountPress={() => {
          setSidebarVisible(false);
          router.push('/Account');
        }}
        onEnterprisePress={() => {
          setSidebarVisible(false);
          router.push('/Enterprise');
        }}
        onNotificationPress={() => {
          setSidebarVisible(false);
          router.push('/Notification');
        }}
        onLogout={() => {
          logout();
          setSidebarVisible(false);
        }}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchReport(true)}
            colors={[colors.primary]}
          />
        }
      >
        {/* Cabeçalho de Navegação por Ano */}
        <View style={styles.yearSelectorCard}>
          <TouchableOpacity
            style={styles.yearButton}
            onPress={() => setSelectedYear((prev) => prev - 1)}
          >
            <Feather name="chevron-left" size={22} color={colors.primary} />
          </TouchableOpacity>

          <View style={styles.yearTitleContainer}>
            <Text style={styles.yearTitle}>{selectedYear}</Text>
            <Text style={styles.yearSubtitle}>
              {activeEnterprise?.company_name
                ? activeEnterprise.company_name
                : 'Todas as Empresas'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.yearButton}
            onPress={() => setSelectedYear((prev) => prev + 1)}
          >
            <Feather name="chevron-right" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
        ) : (
          <>
            {/* Cards de Resumo Anual */}
            <View style={styles.kpiGrid}>
              <View style={[styles.kpiCard, { borderLeftColor: '#27ae60' }]}>
                <Text style={styles.kpiLabel}>Receitas ({selectedYear})</Text>
                <Text style={[styles.kpiValue, { color: '#27ae60' }]}>
                  {formatCurrency(total?.income_total || 0)}
                </Text>
                <Text style={styles.kpiSub}>
                  {total?.income_quantity || 0} lançamentos recebidos
                </Text>
              </View>

              <View style={[styles.kpiCard, { borderLeftColor: '#e74c3c' }]}>
                <Text style={styles.kpiLabel}>Despesas + DAS</Text>
                <Text style={[styles.kpiValue, { color: '#e74c3c' }]}>
                  {formatCurrency((total?.expense_total || 0) + (total?.daspayment_total || 0))}
                </Text>
                <Text style={styles.kpiSub}>
                  {total?.expense_quantity || 0} despesas / {total?.das_quantity || 0} DAS
                </Text>
              </View>

              <View style={[styles.kpiCard, { borderLeftColor: colors.primary }]}>
                <Text style={styles.kpiLabel}>Resultado Líquido</Text>
                <Text
                  style={[
                    styles.kpiValue,
                    {
                      color:
                        (total?.balance || 0) >= 0 ? colors.primary : '#e74c3c',
                    },
                  ]}
                >
                  {formatCurrency(total?.balance || 0)}
                </Text>
                <Text style={styles.kpiSub}>Margem de Lucro: {profitMargin}%</Text>
              </View>

              <View style={[styles.kpiCard, { borderLeftColor: '#8e44ad' }]}>
                <Text style={styles.kpiLabel}>Notas Fiscais Emitidas</Text>
                <Text style={[styles.kpiValue, { color: '#8e44ad' }]}>
                  {formatCurrency(total?.invoice_total || 0)}
                </Text>
                <Text style={styles.kpiSub}>{total?.invoice_quantity || 0} notas registradas</Text>
              </View>
            </View>

            {/* Gráfico de Barras Mensal (Receitas x Despesas) */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <View>
                  <Text style={styles.chartTitle}>Evolução Mensal ({selectedYear})</Text>
                  <Text style={styles.chartSub}>Toque no mês para ver os detalhes</Text>
                </View>

                {/* Legenda */}
                <View style={styles.legendContainer}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#27ae60' }]} />
                    <Text style={styles.legendText}>Receitas</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#e74c3c' }]} />
                    <Text style={styles.legendText}>Despesas</Text>
                  </View>
                </View>
              </View>

              {/* Área das Barras com Scroll Horizontal para Caber Confortavelmente */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.barsContainer}
              >
                {months.map((item, index) => {
                  const income = Number(item.income_monthly_total) || 0;
                  const expense =
                    (Number(item.expense_monthly_total) || 0) +
                    (Number(item.daspayment_monthly_total) || 0);

                  const maxBarHeight = 110;
                  const incomeHeight = Math.max(4, (income / maxIncomeOrExpense) * maxBarHeight);
                  const expenseHeight = Math.max(4, (expense / maxIncomeOrExpense) * maxBarHeight);

                  const isSelected = selectedMonthIndex === index;

                  return (
                    <TouchableOpacity
                      key={item.month}
                      style={[styles.monthColumn, isSelected && styles.monthColumnSelected]}
                      onPress={() => setSelectedMonthIndex(index)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.barPairWrapper}>
                        {/* Barra de Receita */}
                        <View
                          style={[
                            styles.bar,
                            {
                              height: incomeHeight,
                              backgroundColor: '#27ae60',
                            },
                          ]}
                        />
                        {/* Barra de Despesa */}
                        <View
                          style={[
                            styles.bar,
                            {
                              height: expenseHeight,
                              backgroundColor: '#e74c3c',
                            },
                          ]}
                        />
                      </View>

                      {/* Rótulo do Mês */}
                      <Text
                        style={[
                          styles.monthLabel,
                          isSelected && styles.monthLabelSelected,
                        ]}
                      >
                        {MONTH_NAMES[index]}
                      </Text>

                      {isSelected && <View style={styles.selectedIndicatorDot} />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Painel de Detalhes do Mês Selecionado */}
            {selectedMonthData && (
              <View style={styles.detailCard}>
                <View style={styles.detailHeader}>
                  <Feather name="calendar" size={18} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.detailTitle}>
                    Detalhamento de {MONTH_NAMES[selectedMonthIndex]} / {selectedYear}
                  </Text>
                </View>

                <View style={styles.detailRows}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>Receitas Recebidas:</Text>
                    <Text style={[styles.detailRowValue, { color: '#27ae60' }]}>
                      {formatCurrency(Number(selectedMonthData.income_monthly_total))}
                    </Text>
                  </View>

                  {Number(selectedMonthData.income_monthly_total_pending) > 0 && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailRowLabel}>Receitas Pendentes:</Text>
                      <Text style={[styles.detailRowValue, { color: '#f39c12' }]}>
                        {formatCurrency(Number(selectedMonthData.income_monthly_total_pending))}
                      </Text>
                    </View>
                  )}

                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>Despesas Operacionais:</Text>
                    <Text style={[styles.detailRowValue, { color: '#e74c3c' }]}>
                      {formatCurrency(Number(selectedMonthData.expense_monthly_total))}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>Guia DAS MEI:</Text>
                    <Text style={[styles.detailRowValue, { color: '#d35400' }]}>
                      {formatCurrency(Number(selectedMonthData.daspayment_monthly_total))}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>Notas Fiscais ({selectedMonthData.invoice_monthly_quantity}):</Text>
                    <Text style={[styles.detailRowValue, { color: '#8e44ad' }]}>
                      {formatCurrency(Number(selectedMonthData.invoice_monthly_total))}
                    </Text>
                  </View>

                  <View style={[styles.detailRow, styles.detailBalanceRow]}>
                    <Text style={styles.detailBalanceLabel}>Resultado Líquido do Mês:</Text>
                    <Text
                      style={[
                        styles.detailBalanceValue,
                        {
                          color:
                            selectedMonthData.balance >= 0 ? colors.primary : '#e74c3c',
                        },
                      ]}
                    >
                      {formatCurrency(selectedMonthData.balance)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  yearSelectorCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  yearButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#eef6ff',
  },
  yearTitleContainer: {
    alignItems: 'center',
  },
  yearTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2c3e50',
  },
  yearSubtitle: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  kpiCard: {
    width: (screenWidth - 42) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  kpiLabel: {
    fontSize: 11,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  kpiValue: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },
  kpiSub: {
    fontSize: 10,
    color: '#95a5a6',
    marginTop: 2,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2c3e50',
  },
  chartSub: {
    fontSize: 11,
    color: '#7f8c8d',
    marginTop: 2,
  },
  legendContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 10,
    color: '#555',
    fontWeight: '500',
  },
  barsContainer: {
    paddingVertical: 10,
    gap: 8,
    alignItems: 'flex-end',
  },
  monthColumn: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  monthColumnSelected: {
    backgroundColor: '#eef6ff',
  },
  barPairWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    gap: 4,
    paddingBottom: 4,
  },
  bar: {
    width: 10,
    borderRadius: 4,
  },
  monthLabel: {
    fontSize: 11,
    color: '#7f8c8d',
    fontWeight: '600',
    marginTop: 4,
  },
  monthLabelSelected: {
    color: colors.primary,
    fontWeight: '800',
  },
  selectedIndicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 2,
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#eef2f6',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f4f8',
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2c3e50',
  },
  detailRows: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailRowLabel: {
    fontSize: 13,
    color: '#555',
  },
  detailRowValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  detailBalanceRow: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f4f8',
  },
  detailBalanceLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2c3e50',
  },
  detailBalanceValue: {
    fontSize: 16,
    fontWeight: '900',
  },
});
