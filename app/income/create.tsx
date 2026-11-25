import Feather from '@expo/vector-icons/Feather';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Keyboard,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useEnterprise } from '../../contexts/EnterpriseContext';
import api from '../../services/api';
import DateInput from '../../src/components/DateInput';
import Header from '../../src/components/HeaderSecundary';
import Input from '../../src/components/Input';
import ToggleRecebido from '../../src/components/ToggleRecebido';
import { currencyToNumber, maskCurrency } from '../../src/utils/masks';

export default function CreateIncome() {
  const { activeEnterprise } = useEnterprise();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [received, setReceived] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pageTitle = 'Inclusão de Receita';

  const handleSubmit = async () => {
    // Validar se há empresa ativa selecionada
    if (!activeEnterprise?.id) {
      Toast.show({
        type: 'error',
        text1: 'Empresa Obrigatória',
        text2: 'Cadastre ou selecione uma empresa antes de registrar receitas.',
      });
      router.push('/Enterprise');
      return;
    }

    // Validar campos
    if (!description.trim() || !amount.trim() || !date) {
      Toast.show({
        type: 'error',
        text1: 'Campos Obrigatórios',
        text2: 'Preencha a descrição, valor e data de recebimento.',
      });
      return;
    }

    const numericAmount = currencyToNumber(amount);
    if (numericAmount <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Valor Inválido',
        text2: 'Informe um valor maior que R$ 0,00.',
      });
      return;
    }

    try {
      setLoading(true);

      const data = {
        description: description.trim(),
        amount: numericAmount,
        date: formatDateToDatabase(date),
        received,
        enterprise_id: activeEnterprise.id,
      };

      await api.post('/incomes', data);

      Toast.show({
        type: 'success',
        text1: 'Sucesso!',
        text2: 'Receita cadastrada com sucesso ✅',
      });

      // Limpar campos
      setDescription('');
      setAmount('');
      setDate(new Date());
      setReceived(false);

      // Direcionar para a listagem
      router.push('/income/list');
    } catch (error: any) {
      console.error('Erro ao enviar dados:', error);
      const msg = error?.response?.data?.message || 'Ocorreu um erro ao salvar os dados.';
      Toast.show({
        type: 'error',
        text1: 'Erro!',
        text2: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDateToDatabase = (dateString: any) => {
    const d = new Date(dateString);
    return format(d, 'yyyy-MM-dd');
  };

  return (
    <View style={styles.container}>
      <Header title={pageTitle} showBackButton onBack={() => router.push('/Finance')} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* Banner de alerta caso não haja empresa ativa */}
          {!activeEnterprise ? (
            <View style={styles.warningBanner}>
              <View style={styles.warningIconWrapper}>
                <Feather name="alert-triangle" size={20} color="#d97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.warningTitle}>Nenhuma Empresa Selecionada</Text>
                <Text style={styles.warningText}>
                  É necessário cadastrar ou selecionar uma empresa para registrar receitas.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.bannerButton}
                onPress={() => router.push('/Enterprise')}
              >
                <Text style={styles.bannerButtonText}>Cadastrar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.enterpriseBadge}>
              <View style={styles.enterpriseBadgeIcon}>
                <Feather name="briefcase" size={14} color="#10b981" />
              </View>
              <Text style={styles.enterpriseBadgeText} numberOfLines={1}>
                Registrando para: <Text style={{ fontWeight: '700', color: '#0f172a' }}>{activeEnterprise.company_name}</Text>
              </Text>
            </View>
          )}

          {/* Card Principal do Formulário */}
          <View style={styles.formCard}>
            <View style={styles.cardHeader}>
              <View style={styles.categoryIconCircle}>
                <Feather name="arrow-down-left" size={24} color="#10b981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Nova Receita</Text>
                <Text style={styles.cardSubtitle}>
                  Vendas de produtos ou serviços que compõem seu faturamento MEI
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Input
              label="Descrição da Receita *"
              value={description}
              onChangeText={setDescription}
              placeholder="Ex: Consultoria de TI, Venda de Artesanato..."
            />

            <Input
              label="Valor Recebido (R$) *"
              value={amount}
              onChangeText={(text) => setAmount(maskCurrency(text))}
              placeholder="R$ 0,00"
              keyboardType="numeric"
            />

            <DateInput
              label="Data de Recebimento *"
              value={date}
              onChange={setDate}
            />

            <ToggleRecebido value={received} onChange={setReceived} />

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              activeOpacity={0.85}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Feather name="check" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.submitButtonText}>Salvar Receita</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
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

  // Banner de Alerta
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  warningIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 9,
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
  },
  bannerButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  bannerButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  // Badge da Empresa Ativa
  enterpriseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  enterpriseBadgeIcon: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  enterpriseBadgeText: {
    fontSize: 13,
    color: '#64748b',
    flex: 1,
  },

  // Card do Formulário
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0f172a',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginBottom: 20,
  },

  // Botão de Envio
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 24,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
