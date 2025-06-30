import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Header from '../../src/components/Header';

export default function Home() {
  return (
    <View style={styles.wrapper}>
      <Header />

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Resumo</Text>
        <View style={styles.cardGrid}>
          <Card icon="cash-outline" label="Receita" value="R$ 3.500" />
          <Card icon="card-outline" label="Despesas" value="R$ 1.900" />
          <Card icon="document-text-outline" label="Notas Fiscais" value="12" />
          <Card icon="stats-chart-outline" label="Total" value="R$ 5.400" />
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
    fontSize: 16,
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