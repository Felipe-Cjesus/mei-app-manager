// app/(tabs)/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Header from '../../src/components/Header';
import Sidebar from '../Sidebar';

export default function Home() {
  const router = useRouter();
  const { logout } = useAuth();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const [summary, setSummary] = useState({
    income_total: 0,
    expense_total: 0,
    daspayment_total: 0,
    invoice_quantity: 0,
    balance: 0,
  });

  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const response = await api.get('/reports/monthly');
        const { income_total, expense_total, daspayment_total, invoice_quantity, balance } = response.data.data.total;
        //console.log('🔍 response.data: ', JSON.stringify(response.data, null, 2));
        setSummary({ income_total, expense_total, daspayment_total, invoice_quantity, balance });
      } catch (error) {
        console.error('Erro ao buscar resumo:', error);
      }
    }

    fetchSummary();
  }, []);

  return (
    <View style={styles.wrapper}>
      <Header
        onNotificationPress={() => router.push('/Notification')}
        // onSettingsPress={() => router.push('/Sidebar')}
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

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Resumo {new Date().getFullYear()}</Text>
        <View style={styles.cardGrid}>
          <Card icon="cash-outline" label="Receita" value={formatCurrency(summary.income_total)}  />
          <Card icon="card-outline" label="Despesas" value={formatCurrency(summary.expense_total + summary.daspayment_total)} />
          <Card icon="document-text-outline" label="Notas Fiscais" value={String(summary.invoice_quantity || 0)} />
          {/* <Card icon="stats-chart-outline" label="Total" value={`R$ ${summary.balance.toFixed(2) || 0}`} /> */}
          <Card icon="stats-chart-outline" label="Total" value={formatCurrency(summary.balance)} />
        </View>
      </View>
    </View>
  );
}

function Card({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.card}>
      <Ionicons name={icon} size={24} color="#1565C0" />
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
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
    color: '#2979FF',
    marginTop: 4,
  },
});