import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import api from '../../services/api';
import Button from '../../src/components/Button';
import Header from '../../src/components/HeaderSecundary';

type IncomeItem = {
  id: number;
  description: string;
  amount: number;
  date: string;
  received: boolean;
};

export default function IncomeList() {
  const [data, setData] = useState<IncomeItem[]>([]);
  const router = useRouter();
  const pageTitle = 'Listagem de Receitas';

  useEffect(() => {
    async function fetchIncome() {
      try {
        const response = await api.get('/incomes');
        setData(response.data.data);

        console.log('🔍 response.INDEX:', JSON.stringify(response.data.data, null, 2));
      
      } catch (error) {
        console.error('Erro ao carregar receitas:', error);
      }
    }

    fetchIncome();
  }, []);

  return (
    <View style={styles.container}>
      <Header title={pageTitle} />
      {/* <Header /> */}
      <View style={styles.content}>
        <Text style={styles.title}>Receitas</Text>

        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.desc}>{item.description}</Text>
              <Text style={styles.amount}>R$ {item.amount.toFixed(2)}</Text>
              <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
              <Text style={styles.date}>{item.received ? 'Recebido' : 'Pendente'}</Text>
            </View>
          )}
        />
        <Button title="Voltar" onPress={() => router.push('/Finance')} style={{ marginTop: 16 }} />
      </View>
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
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1565C0',
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
  desc: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
});