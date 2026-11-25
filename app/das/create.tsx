import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Keyboard,
    ScrollView,
    StyleSheet,
    Text,
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
      ...(activeEnterprise?.id ? { enterprise_id: activeEnterprise.id } : {}),
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
        Toast.show({
          type: 'error',
          text1: 'Erro!',
          text2: 'Ocorreu um erro ao salvar a guia.',
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
});