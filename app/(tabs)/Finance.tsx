import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useEnterprise } from '../../contexts/EnterpriseContext';
import Header from '../../src/components/HeaderSecundary';
import colors from '../../src/theme/colors';

export default function Finance() {
  const router = useRouter();
  const { activeEnterprise } = useEnterprise();
  const pageTitle = 'Gerenciador Financeiro';

  const handleAction = (route: string, isInclude: boolean) => {
    if (isInclude && !activeEnterprise?.id) {
      Toast.show({
        type: 'error',
        text1: 'Empresa Obrigatória',
        text2: 'Cadastre ou selecione uma empresa antes de fazer novos lançamentos.',
      });
      router.push('/Enterprise');
      return;
    }
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <Header title={pageTitle} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner de Empresa Ativa ou Alerta de Seleção */}
        {!activeEnterprise ? (
          <View style={styles.warningBanner}>
            <View style={styles.warningIconWrapper}>
              <Feather name="alert-triangle" size={22} color="#d97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.warningTitle}>Nenhuma Empresa Ativa</Text>
              <Text style={styles.warningText}>
                Cadastre ou selecione uma empresa para habilitar os lançamentos financeiros.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.warningButton}
              activeOpacity={0.8}
              onPress={() => router.push('/Enterprise')}
            >
              <Text style={styles.warningButtonText}>Cadastrar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.enterpriseCard}
            activeOpacity={0.8}
            onPress={() => router.push('/Enterprise')}
          >
            <View style={styles.enterpriseIconBox}>
              <Feather name="briefcase" size={18} color={colors.primary} />
            </View>
            <View style={styles.enterpriseInfo}>
              <Text style={styles.enterpriseLabel}>Empresa em gestão</Text>
              <Text style={styles.enterpriseName} numberOfLines={1}>
                {activeEnterprise.company_name}
              </Text>
              <Text style={styles.enterpriseCnpj}>
                CNPJ: {activeEnterprise.company_id}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#94a3b8" />
          </TouchableOpacity>
        )}

        {/* Módulo de Receitas */}
        <View style={[styles.moduleCard, styles.incomeCardBorder]}>
          <View style={styles.moduleHeader}>
            <View style={[styles.moduleIconContainer, { backgroundColor: '#ecfdf5' }]}>
              <Feather name="arrow-down-left" size={22} color="#10b981" />
            </View>
            <View style={styles.moduleHeaderText}>
              <Text style={styles.moduleTitle}>Receitas</Text>
              <Text style={styles.moduleSubtitle}>
                Monitore recebimentos e faturamento do seu MEI
              </Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.primaryActionBtn, { backgroundColor: '#10b981' }]}
              activeOpacity={0.85}
              onPress={() => handleAction('/income/create', true)}
            >
              <Feather name="plus-circle" size={17} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.primaryActionText}>Nova Receita</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryActionBtn, { borderColor: '#a7f3d0' }]}
              activeOpacity={0.7}
              onPress={() => handleAction('/income/list', false)}
            >
              <Feather name="list" size={16} color="#059669" style={{ marginRight: 6 }} />
              <Text style={[styles.secondaryActionText, { color: '#059669' }]}>Listar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Módulo de Despesas */}
        <View style={[styles.moduleCard, styles.expenseCardBorder]}>
          <View style={styles.moduleHeader}>
            <View style={[styles.moduleIconContainer, { backgroundColor: '#fff7ed' }]}>
              <Feather name="arrow-up-right" size={22} color="#f97316" />
            </View>
            <View style={styles.moduleHeaderText}>
              <Text style={styles.moduleTitle}>Despesas</Text>
              <Text style={styles.moduleSubtitle}>
                Controle custos operacionais e notas fiscais de entrada
              </Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.primaryActionBtn, { backgroundColor: '#f97316' }]}
              activeOpacity={0.85}
              onPress={() => handleAction('/expense/create', true)}
            >
              <Feather name="plus-circle" size={17} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.primaryActionText}>Nova Despesa</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryActionBtn, { borderColor: '#fed7aa' }]}
              activeOpacity={0.7}
              onPress={() => handleAction('/expense/list', false)}
            >
              <Feather name="list" size={16} color="#c2410c" style={{ marginRight: 6 }} />
              <Text style={[styles.secondaryActionText, { color: '#c2410c' }]}>Listar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Módulo de Guia DAS */}
        <View style={[styles.moduleCard, styles.dasCardBorder]}>
          <View style={styles.moduleHeader}>
            <View style={[styles.moduleIconContainer, { backgroundColor: '#eff6ff' }]}>
              <Feather name="file-text" size={22} color="#2563eb" />
            </View>
            <View style={styles.moduleHeaderText}>
              <Text style={styles.moduleTitle}>Guia DAS</Text>
              <Text style={styles.moduleSubtitle}>
                Documento de Arrecadação do Simples Nacional do MEI
              </Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.primaryActionBtn, { backgroundColor: '#2563eb' }]}
              activeOpacity={0.85}
              onPress={() => handleAction('/das/create', true)}
            >
              <Feather name="plus-circle" size={17} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.primaryActionText}>Registrar DAS</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryActionBtn, { borderColor: '#bfdbfe' }]}
              activeOpacity={0.7}
              onPress={() => handleAction('/das/list', false)}
            >
              <Feather name="calendar" size={16} color="#1d4ed8" style={{ marginRight: 6 }} />
              <Text style={[styles.secondaryActionText, { color: '#1d4ed8' }]}>Listar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dica do Especialista MEI */}
        <View style={styles.tipCard}>
          <View style={styles.tipIconBox}>
            <Feather name="shield" size={18} color="#475569" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>Organização Fiscal</Text>
            <Text style={styles.tipDescription}>
              Mantenha o faturamento e as despesas atualizados para o cálculo correto do teto anual do MEI (R$ 81.000,00) e a emissão do DASN-SIMEI.
            </Text>
          </View>
        </View>
      </ScrollView>
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
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },

  // Alerta de empresa não selecionada
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    shadowColor: '#d97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  warningIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
  },
  warningText: {
    fontSize: 12,
    color: '#b45309',
    marginTop: 2,
    lineHeight: 16,
  },
  warningButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  warningButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  // Card da Empresa Ativa
  enterpriseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  enterpriseIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  enterpriseInfo: {
    flex: 1,
  },
  enterpriseLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  enterpriseName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 1,
  },
  enterpriseCnpj: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },

  // Cards de Módulos (Receitas, Despesas, DAS)
  moduleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  incomeCardBorder: {
    borderColor: '#d1fae5',
  },
  expenseCardBorder: {
    borderColor: '#ffedd5',
  },
  dasCardBorder: {
    borderColor: '#dbeafe',
  },

  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  moduleIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  moduleHeaderText: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  moduleSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 16,
  },

  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryActionBtn: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  primaryActionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1.2,
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Card de Dica
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tipIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 2,
  },
  tipDescription: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 17,
  },
});
