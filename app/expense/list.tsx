import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import api from '../../services/api';
import Button from '../../src/components/Button';
import DateInput from '../../src/components/DateInput';
import Header from '../../src/components/HeaderSecundary';
import Input from '../../src/components/Input';
import colors from '../../src/theme/colors';

type ExpenseItem = {
  id: number;
  description: string;
  amount: number;
  date: string;
  received: boolean;
};

export default function ExpenseList() {
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

  const formatDateToDatabase = (dateString : any) => {
    const date = new Date(dateString);
    return format(date, 'yyyy-MM-dd');  // Formata como "2025-09-21"
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

  async function fetchExpense(pageNumber = 1, date='', description='') {
    try {
      setLoading(true);
      const dateFormatted = date;
      const descriptionFormatted = description;
      let dateQuery = "";
      let descriptionQuery = "";

      if(dateFormatted !== '') {
        dateQuery = "&date=" + dateFormatted;
      }
      if(descriptionFormatted !== '') {
        descriptionQuery = "&description=" + descriptionFormatted;
      }

      const response = await api.get(`/expenses?page=${pageNumber}&perPage=${perPage}`+dateQuery);
    //   console.log(`/expenses?page=${pageNumber}&perPage=${perPage}`+dateQuery+descriptionQuery);
      const items: ExpenseItem[] = response.data.data.data;
      const currentPage = response.data.data.current_page;
      const last = response.data.data.last_page;

      setData(items);
      setPage(currentPage);
      setLastPage(last);
      setNameFilter('');
      setDateFilter(null);
    } catch (error) {
      console.error('Erro ao carregar despesas:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchExpense(1);
  }, []);

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
      <Header title={pageTitle} />
      <View style={styles.content}>
        {/* <Text style={styles.title}>Filtros</Text> */}
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
        <Button title="Procurar" onPress={() => fetchExpense(1, formatDateToDatabase(dateFilter), nameFilter)} style={styles.filterButton}/>
        
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
                  <Text style={styles.desc}>{item.description}</Text>
                  <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
                  <Text style={styles.date}>
                    {new Date(item.date).toLocaleDateString()}
                  </Text>
                  <Text style={styles.date}>
                    {item.received ? 'Recebido' : 'Pendente'}
                  </Text>
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