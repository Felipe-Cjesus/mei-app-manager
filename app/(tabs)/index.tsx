// app/(tabs)/index.tsx
// import { Ionicons } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../contexts/AuthContext';
import { useEnterprise } from '../../contexts/EnterpriseContext';
import api from '../../services/api';
import Button from '../../src/components/Button';
import DateInput from '../../src/components/DateInput';
import Header from '../../src/components/Header';
import MeiThermometer from '../../src/components/MeiThermometer';
import colors from '../../src/theme/colors';
import Sidebar from '../Sidebar';

export default function Home() {
  const router = useRouter();
  const { logout } = useAuth();
  const { activeEnterprise } = useEnterprise();
  const [yearReference, setYearReference] = useState<Date | null>(null);

  const [titleYear, setTitleYear] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDateToDatabase = (dateString: any) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return format(date, 'yyyy');
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

  const fetchSummary = useCallback(async (year = '', isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }
      const params: string[] = [];
      if (year && year !== '') {
        params.push(`year=${encodeURIComponent(year)}`);
      }
      if (activeEnterprise?.id) {
        params.push(`enterprise_id=${encodeURIComponent(activeEnterprise.id)}`);
      }

      const queryString = params.length > 0 ? '?' + params.join('&') : '';
      setTitleYear(year);

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

      if (year !== '' && !isRefresh) {
        Toast.show({
          type: 'success',
          text1: 'Sucesso!',
          text2: 'Resumo atualizado com sucesso ✅',
        });
      }
    } catch (error) {
      console.error('Erro ao buscar resumo:', error);
    } finally {
      setRefreshing(false);
    }
  }, [activeEnterprise?.id]);

  useEffect(() => {
    fetchSummary(yearReference ? formatDateToDatabase(yearReference) : '');
  }, [fetchSummary, activeEnterprise?.id, yearReference]);

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
            onRefresh={() => fetchSummary(yearReference ? formatDateToDatabase(yearReference) : '', true)}
            colors={[colors.primary]}
          />
        }
      >
        <Text style={styles.sectionTitle}>
          Resumo {titleYear ? titleYear : new Date().getFullYear()}
        </Text>

        <DateInput
          placeholder="Selecionar ano de referência"
          value={yearReference}
          onChange={(selectedDate) => {
            if (selectedDate) setYearReference(selectedDate);
          }}
        />
        <Button 
          title="Filtrar" 
          onPress={() => {
            if (yearReference) {
              fetchSummary(formatDateToDatabase(yearReference));
            } else {
              Toast.show({
                type: 'info',
                text1: 'Atenção',
                text2: 'Selecione uma data para filtrar o ano.',
              });
            }
          }} 
          style={styles.filterButton}
        />

        {/* Termômetro do Limite Anual do MEI (R$ 81.000,00) */}
        <MeiThermometer
          revenue={summary.income_total}
          year={titleYear || (yearReference ? formatDateToDatabase(yearReference) : new Date().getFullYear())}
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
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
  filterButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginBottom: 8,
  },
});