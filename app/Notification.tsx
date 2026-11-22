// app/Notification.tsx
import Feather from '@expo/vector-icons/Feather';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import api from '../services/api';
import Button from '../src/components/Button';
import Header from '../src/components/HeaderSecundary';
import colors from '../src/theme/colors';

type AlertItem = {
  id: number;
  title: string;
  message: string;
  type: string; // 'das' | 'income' | 'system'
  read: boolean;
  read_at?: string | null;
  created_at: string;
};

type FilterType = 'all' | 'unread' | 'das' | 'income';

export default function Notification() {
  const router = useRouter();

  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const fetchAlerts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      let queryParams = '';
      if (activeFilter === 'unread') {
        queryParams = '?read=0';
      } else if (activeFilter === 'das') {
        queryParams = '?type=das';
      } else if (activeFilter === 'income') {
        queryParams = '?type=income';
      }

      const response = await api.get('/alerts' + queryParams);
      const data: AlertItem[] = response.data?.data || [];
      setAlerts(data);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível carregar as notificações.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleMarkAsRead = async (id: number) => {
    try {
      // Atualização otimista no estado local
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === id ? { ...alert, read: true, read_at: new Date().toISOString() } : alert
        )
      );

      await api.put(`/alerts/${id}/read`);
    } catch (error) {
      console.error('Erro ao marcar alerta como lido:', error);
      await fetchAlerts();
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadAlerts = alerts.filter((a) => !a.read);
    if (unreadAlerts.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Tudo em dia!',
        text2: 'Você não possui notificações não lidas.',
      });
      return;
    }

    try {
      // Atualização otimista
      setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));

      await Promise.all(
        unreadAlerts.map((alert) => api.put(`/alerts/${alert.id}/read`).catch(() => null))
      );

      Toast.show({
        type: 'success',
        text1: 'Pronto!',
        text2: 'Todas as notificações foram marcadas como lidas ✅',
      });
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      await fetchAlerts();
    }
  };

  const unreadCount = alerts.filter((a) => !a.read).length;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'das':
        return { name: 'calendar' as const, color: '#f39c12', bg: '#fef5e7' };
      case 'income':
        return { name: 'alert-triangle' as const, color: '#e74c3c', bg: '#fdedec' };
      default:
        return { name: 'bell' as const, color: colors.primary, bg: '#eef6ff' };
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Notificações & Alertas 🔔" />

      <View style={styles.content}>
        {/* Barra de Filtros por Categoria */}
        <View style={styles.filterBar}>
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]}
            onPress={() => setActiveFilter('all')}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === 'all' && styles.filterChipTextActive,
              ]}
            >
              Todas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'unread' && styles.filterChipActive]}
            onPress={() => setActiveFilter('unread')}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === 'unread' && styles.filterChipTextActive,
              ]}
            >
              Não lidas {unreadCount > 0 ? `(${unreadCount})` : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'das' && styles.filterChipActive]}
            onPress={() => setActiveFilter('das')}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === 'das' && styles.filterChipTextActive,
              ]}
            >
              Guia DAS
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'income' && styles.filterChipActive]}
            onPress={() => setActiveFilter('income')}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === 'income' && styles.filterChipTextActive,
              ]}
            >
              Limite MEI
            </Text>
          </TouchableOpacity>
        </View>

        {/* Ação rápida para marcar todas como lidas */}
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={handleMarkAllAsRead}
          >
            <Feather name="check-circle" size={15} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.markAllButtonText}>Marcar todas como lidas</Text>
          </TouchableOpacity>
        )}

        {/* Lista de Alertas */}
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={alerts}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchAlerts(true)}
                colors={[colors.primary]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Feather name="bell-off" size={48} color="#ccc" style={{ marginBottom: 12 }} />
                <Text style={styles.emptyTitle}>Nenhuma notificação por aqui</Text>
                <Text style={styles.emptySubtitle}>
                  Quando houver guias a vencer ou avisos de faturamento, eles aparecerão aqui.
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const iconInfo = getAlertIcon(item.type);
              const formattedDate = item.created_at
                ? format(new Date(item.created_at), "dd/MM/yyyy 'às' HH:mm")
                : '';

              return (
                <TouchableOpacity
                  style={[styles.alertCard, !item.read && styles.alertCardUnread]}
                  onPress={() => {
                    if (!item.read) {
                      handleMarkAsRead(item.id);
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconWrapper, { backgroundColor: iconInfo.bg }]}>
                    <Feather name={iconInfo.name} size={20} color={iconInfo.color} />
                  </View>

                  <View style={styles.alertBody}>
                    <View style={styles.alertHeaderRow}>
                      <Text
                        style={[
                          styles.alertTitle,
                          !item.read && styles.alertTitleUnread,
                        ]}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      {!item.read && <View style={styles.unreadDot} />}
                    </View>

                    <Text style={styles.alertMessage}>{item.message}</Text>

                    <Text style={styles.alertDate}>{formattedDate}</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}

        <Button
          title="Voltar"
          onPress={() => router.back()}
          variant="outline"
          style={{ marginTop: 12, marginBottom: 20 }}
        />
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
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  filterBar: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  markAllButtonText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 16,
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  alertCardUnread: {
    backgroundColor: '#f8fbff',
    borderLeftColor: colors.primary,
    elevation: 2,
    shadowOpacity: 0.08,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertBody: {
    flex: 1,
  },
  alertHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  alertTitleUnread: {
    fontWeight: 'bold',
    color: '#111',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: 8,
  },
  alertMessage: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    marginBottom: 6,
  },
  alertDate: {
    fontSize: 11,
    color: '#999',
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
});
