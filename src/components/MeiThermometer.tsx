// src/components/MeiThermometer.tsx
import Feather from '@expo/vector-icons/Feather';
import { StyleSheet, Text, View } from 'react-native';

interface MeiThermometerProps {
  revenue: number;
  year?: number | string;
}

const MEI_LIMIT = 81000.0;

export default function MeiThermometer({ revenue, year }: MeiThermometerProps) {
  const currentYear = year || new Date().getFullYear();
  const safeRevenue = Math.max(0, Number(revenue) || 0);
  const percentage = (safeRevenue / MEI_LIMIT) * 100;
  const clampedProgress = Math.min(100, Math.max(0, percentage));
  const remaining = Math.max(0, MEI_LIMIT - safeRevenue);
  const exceeded = Math.max(0, safeRevenue - MEI_LIMIT);

  // Status visual e cores dinâmicas
  let statusColor = '#27ae60'; // Verde
  let statusBg = '#eafaf1';
  let statusText = 'Limite Seguro';
  let statusIcon: 'check-circle' | 'alert-triangle' | 'alert-octagon' = 'check-circle';

  if (percentage >= 100) {
    statusColor = '#e74c3c'; // Vermelho
    statusBg = '#fdedec';
    statusText = 'Limite Ultrapassado!';
    statusIcon = 'alert-octagon';
  } else if (percentage >= 80) {
    statusColor = '#e67e22'; // Laranja
    statusBg = '#fef5e7';
    statusText = 'Atenção: 80%';
    statusIcon = 'alert-triangle';
  } else if (percentage >= 65) {
    statusColor = '#f39c12'; // Âmbar
    statusBg = '#fef9e7';
    statusText = 'Atenção aos Gastos';
    statusIcon = 'alert-triangle';
  }

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  return (
    <View style={styles.card}>
      {/* Cabeçalho do Card */}
      <View style={styles.headerRow}>
        <View style={styles.titleWrapper}>
          <Feather name="shield" size={18} color="#2c3e50" style={{ marginRight: 6 }} />
          <Text style={styles.cardTitle}>Termômetro MEI ({currentYear})</Text>
        </View>

        <View style={[styles.badge, { backgroundColor: statusBg }]}>
          <Feather name={statusIcon} size={12} color={statusColor} style={{ marginRight: 4 }} />
          <Text style={[styles.badgeText, { color: statusColor }]}>{statusText}</Text>
        </View>
      </View>

      {/* Barra de Progresso */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${clampedProgress}%`,
              backgroundColor: statusColor,
            },
          ]}
        />
      </View>

      {/* Valores e Percentual */}
      <View style={styles.metricsRow}>
        <View>
          <Text style={styles.metricLabel}>Receita Acumulada</Text>
          <Text style={[styles.metricValue, { color: statusColor }]}>{formatBRL(safeRevenue)}</Text>
        </View>

        <View style={{ alignItems: 'center' }}>
          <Text style={styles.metricLabel}>Utilização</Text>
          <Text style={styles.percentageText}>{percentage.toFixed(1)}%</Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.metricLabel}>Teto Fiscal Anual</Text>
          <Text style={styles.tetoValue}>{formatBRL(MEI_LIMIT)}</Text>
        </View>
      </View>

      {/* Rodapé Informativo: Margem Restante ou Excedida */}
      <View style={styles.footerRow}>
        {percentage >= 100 ? (
          <View style={styles.alertNotice}>
            <Feather name="alert-octagon" size={14} color="#e74c3c" style={{ marginRight: 6 }} />
            <Text style={styles.alertNoticeText}>
              Limite excedido em <Text style={{ fontWeight: 'bold' }}>{formatBRL(exceeded)}</Text>.
              Consulte seu contador para orientações sobre migração para ME.
            </Text>
          </View>
        ) : (
          <View style={styles.safeNotice}>
            <Feather name="info" size={13} color="#7f8c8d" style={{ marginRight: 5 }} />
            <Text style={styles.safeNoticeText}>
              Você ainda pode faturar até{' '}
              <Text style={{ fontWeight: 'bold', color: '#27ae60' }}>{formatBRL(remaining)}</Text>{' '}
              neste ano fiscal.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#eceff1',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2c3e50',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressTrack: {
    height: 10,
    backgroundColor: '#edf2f7',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f4f8',
    paddingBottom: 10,
  },
  metricLabel: {
    fontSize: 11,
    color: '#7f8c8d',
    marginBottom: 2,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  percentageText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2c3e50',
  },
  tetoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  footerRow: {
    marginTop: 10,
  },
  safeNotice: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  safeNoticeText: {
    fontSize: 12,
    color: '#555',
    flex: 1,
  },
  alertNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fdedec',
    padding: 8,
    borderRadius: 8,
  },
  alertNoticeText: {
    fontSize: 12,
    color: '#c0392b',
    flex: 1,
    lineHeight: 16,
  },
});
