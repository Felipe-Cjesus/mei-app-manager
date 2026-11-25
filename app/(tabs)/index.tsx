// app/(tabs)/index.tsx
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useEnterprise } from '../../contexts/EnterpriseContext';
import api from '../../services/api';
import Header from '../../src/components/Header';
import MeiThermometer from '../../src/components/MeiThermometer';
import colors from '../../src/theme/colors';
import Sidebar from '../Sidebar';

const AVAILABLE_YEARS = [2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];

export default function Home() {
  const router = useRouter();
  const { logout } = useAuth();
  const { activeEnterprise } = useEnterprise();

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [yearModalVisible, setYearModalVisible] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const [summary, setSummary] = useState({
    income_total: 0,
    income_total_pending: 0,
    expense_total: 0,
    daspayment_total: 0,
    invoice_quantity: 0,
    invoice_total: 0,
    balance: 0,
  });

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSummary = useCallback(async (year: number, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }
      const params: string[] = [`year=${encodeURIComponent(year)}`];
      if (activeEnterprise?.id) {
        params.push(`enterprise_id=${encodeURIComponent(activeEnterprise.id)}`);
      }

      const queryString = '?' + params.join('&');
      const response = await api.get('/reports/monthly' + queryString);
      const total = response.data?.data?.total;

      if (total) {
        const {
          income_total,
          income_total_pending,
          expense_total,
          daspayment_total,
          invoice_quantity,
          invoice_total,
          balance,
        } = total;

        setSummary({
          income_total: income_total || 0,
          income_total_pending: income_total_pending || 0,
          expense_total: expense_total || 0,
          daspayment_total: daspayment_total || 0,
          invoice_quantity: invoice_quantity || 0,
          invoice_total: invoice_total || 0,
          balance: balance || 0,
        });
      }
    } catch (error) {
      console.error('Erro ao buscar resumo:', error);
    } finally {
      setRefreshing(false);
    }
  }, [activeEnterprise?.id]);

  useEffect(() => {
    fetchSummary(selectedYear);
  }, [fetchSummary, activeEnterprise?.id, selectedYear]);

  return (
    <View style={styles.wrapper}>
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
            onRefresh={() => fetchSummary(selectedYear, true)}
            colors={[colors.primary]}
          />
        }
      >
        {/* Seletor de Ano com Navegação Rápida */}
        <View style={styles.yearSelectorCard}>
          <TouchableOpacity
            style={styles.yearArrowButton}
            onPress={() => setSelectedYear((prev) => prev - 1)}
            activeOpacity={0.7}
          >
            <Feather name="chevron-left" size={24} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.yearCenterButton}
            onPress={() => setYearModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.yearTitle}>Resumo {selectedYear}</Text>
            <View style={styles.yearPickerHint}>
              <Text style={styles.yearSubtitle}>Toque para alternar ano</Text>
              <Feather name="calendar" size={12} color="#7f8c8d" style={{ marginLeft: 4 }} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.yearArrowButton}
            onPress={() => setSelectedYear((prev) => prev + 1)}
            activeOpacity={0.7}
          >
            <Feather name="chevron-right" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Termômetro do Limite Anual do MEI (R$ 81.000,00) */}
        <MeiThermometer
          revenue={summary.income_total}
          year={selectedYear}
        />

        <View style={styles.cardGrid}>
          <Card icon="cash-outline" label="Receita recebida" value={formatCurrency(summary.income_total)} />
          <Card icon="warning-outline" label="Receita pendente" value={formatCurrency(summary.income_total_pending)} />
          <Card icon="wallet-outline" label="Despesas" value={formatCurrency(summary.expense_total + summary.daspayment_total)} />
          <Card icon="stats-chart-outline" label="Saldo Líquido" value={formatCurrency(summary.balance)} />
          <Card icon="documents-outline" label="Quantidade NFs" value={String(summary.invoice_quantity || 0)} />
          <Card icon="document-text-outline" label="Notas Fiscais" value={formatCurrency(summary.invoice_total || 0)} />
        </View>
      </ScrollView>

      {/* Modal de Seleção de Ano */}
      <Modal
        visible={yearModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setYearModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setYearModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione o Ano de Referência</Text>
            <View style={styles.yearGrid}>
              {AVAILABLE_YEARS.map((year) => {
                const isSelected = year === selectedYear;
                return (
                  <TouchableOpacity
                    key={year}
                    style={[styles.yearItem, isSelected && styles.yearItemSelected]}
                    onPress={() => {
                      setSelectedYear(year);
                      setYearModalVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.yearItemText,
                        isSelected && styles.yearItemTextSelected,
                      ]}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

function Card({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.card}>
      <Ionicons name={icon} size={24} color={colors.primaryDark} />
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  yearSelectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e8edf2',
  },
  yearArrowButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f8f5',
  },
  yearCenterButton: {
    alignItems: 'center',
    flex: 1,
  },
  yearTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
  },
  yearPickerHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  yearSubtitle: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLabel: {
    marginTop: 8,
    fontSize: 14,
    color: '#444',
  },
  cardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 16,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  yearItem: {
    width: 80,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  yearItemSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  yearItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  yearItemTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
});