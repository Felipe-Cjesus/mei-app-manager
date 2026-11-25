import Feather from '@expo/vector-icons/Feather';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
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
import Button from '../../src/components/Button';
import DateInput from '../../src/components/DateInput';
import Header from '../../src/components/HeaderSecundary';
import Input from '../../src/components/Input';
import TogglePaymentStatus, { StatusType } from '../../src/components/TogglePaymentStatus';
import colors from '../../src/theme/colors';
import { currencyToNumber, maskCurrency, maskReference } from '../../src/utils/masks';

export default function CreateDas() {
  const { activeEnterprise } = useEnterprise();
  const [reference, setReference] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [paymentDate, setPaymentDate] = useState<Date | null>(null);
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<StatusType>('pending');

  const router = useRouter();
  const pageTitle = 'Inclusão de Guia DAS';

  const handleSubmit = () => {
    // Validar se há empresa ativa selecionada
    if (!activeEnterprise?.id) {
      Toast.show({
        type: 'error',
        text1: 'Empresa Obrigatória',
        text2: 'Cadastre ou selecione uma empresa antes de registrar guias DAS.',
      });
      router.push('/Enterprise');
      return;
    }

    if (!reference || !dueDate || !amount || !status) {
      Toast.show({
        type: 'error',
        text1: 'Erro!',
        text2: 'Todos os campos obrigatórios devem ser preenchidos.',
      });
      return;
    }

    const data = {
      reference,
      due_date: formatDateToDatabase(dueDate),
      payment_date: paymentDate ? formatDateToDatabase(paymentDate) : null,
      amount: currencyToNumber(amount),
      status,
      enterprise_id: activeEnterprise.id,
    };

    api.post('/das-payments', data)
      .then(response => {
        Toast.show({
          type: 'success',
          text1: 'Sucesso!',
          text2: 'Guia DAS salva com sucesso ✅',
        });

        // resetar os campos
        setReference('');
        setDueDate(new Date());
        setPaymentDate(null);
        setAmount('');
        setStatus('pending');

        console.log('📤 Dados enviados:', response.data);
      })
      .catch(error => {
        const msg = error?.response?.data?.message || 'Ocorreu um erro ao salvar a guia.';
        Toast.show({
          type: 'error',
          text1: 'Erro!',
          text2: msg,
        });
        console.error('Erro ao enviar dados:', error);
      });
  };

  const formatDateToDatabase = (dateString: any) => {
    const date = new Date(dateString);
    return format(date, 'yyyy-MM-dd');
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
        >
          <Text style={styles.title}>Nova Guia DAS</Text>

          {/* Banner de alerta caso não haja empresa ativa */}
          {!activeEnterprise ? (
            <View style={styles.warningBanner}>
              <Feather name="alert-triangle" size={20} color="#d97706" style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.warningTitle}>Nenhuma Empresa Selecionada</Text>
                <Text style={styles.warningText}>
                  É necessário cadastrar ou selecionar uma empresa para registrar guias DAS.
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
              <Feather name="briefcase" size={14} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.enterpriseBadgeText} numberOfLines={1}>
                Empresa: <Text style={{ fontWeight: '700' }}>{activeEnterprise.company_name}</Text>
              </Text>
            </View>
          )}

          <Input
            label="Referência (MM/AAAA)"
            value={reference}
            onChangeText={(text) => setReference(maskReference(text))}
            placeholder="Ex: 05/2026"
            keyboardType="numeric"
            maxLength={7}
          />

          <Input
            label="Valor (R$)"
            value={amount}
            onChangeText={(text) => setAmount(maskCurrency(text))}
            placeholder="R$ 0,00"
            keyboardType="numeric"
          />

          <DateInput
            label="Data de vencimento"
            value={dueDate}
            onChange={setDueDate}
          />

          <DateInput
            label="Data de pagamento (opcional)"
            value={paymentDate || new Date()}
            onChange={setPaymentDate}
          />

          <TogglePaymentStatus value={status} onChange={setStatus} />

          <Button 
            title="Salvar" 
            onPress={handleSubmit} 
            style={{ marginTop: 16 }} 
          />
        </ScrollView>
      </TouchableWithoutFeedback>
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
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    marginBottom: 16,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: 'bold',
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
    borderRadius: 6,
    marginLeft: 8,
  },
  bannerButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  enterpriseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  enterpriseBadgeText: {
    fontSize: 13,
    color: colors.primaryDark,
    flex: 1,
  },
});