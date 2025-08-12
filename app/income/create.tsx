import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import api from '../../services/api';
import Button from '../../src/components/Button';
import DateInput from '../../src/components/DateInput';
import Header from '../../src/components/HeaderSecundary';
import Input from '../../src/components/Input';
import ToggleRecebido from '../../src/components/ToggleRecebido';
import colors from '../../src/theme/colors';

export default function CreateIncome() {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const router = useRouter();
  const [received, setReceived] = useState(false);
  const pageTitle = 'Inclusão de Receita';

  const handleSubmit = () => {

    // Validar campos
    if (!description || !amount || !date) {
      Toast.show({
        type: 'error',
        text1: 'Erro!',
        text2: 'Todos os campos obrigatórios devem ser preenchidos.',
      });
      return;
    }

    // Enviar dados para API
    const data = {
      description,
      amount,
      date : formatDateToDatabase(date),
      received,
    };

    // Enviar dados para a API usando axios
    api.post('/incomes', data)
    .then(response => {
      Toast.show({
        type: 'success',
        text1: 'Sucesso!',
        text2: 'Dados salvos com sucesso ✅',
      });

      // Limpar campos
      setDescription('');
      setAmount('');
      setDate(new Date());
      setReceived(false);

      console.log('📤 Dados enviados:', response.data);
    })
    .catch(error => {
      Toast.show({
        type: 'error',
        text1: 'Erro!',
        text2: 'Ocorreu um erro ao salvar os dados.',
      });
      console.error('Erro ao enviar dados:', error);
    });

    // console.log('📤 Enviando:', { description, amount, date , received});
    console.log('📤 Dados enviados:', data);
  };

  const formatDateToDatabase = (dateString : any) => {
    const date = new Date(dateString);
    return format(date, 'yyyy-MM-dd');  // Formata como "2025-09-21"
  };

  return (
    <View style={styles.container}>
      <Header title={pageTitle} />
      <View style={styles.content}>
        <Text style={styles.title}>Nova Receita</Text>

        <Input
          label="Descrição"
          value={description}
          onChangeText={setDescription}
          placeholder="Ex: Pagamento de serviço"
        />

        <Input
          label="Valor"
          value={amount}
          onChangeText={setAmount}
          placeholder="Ex: 3500.00"
          keyboardType="numeric"
        />

        <DateInput
          label="Data de recebimento"
          value={date}
          onChange={setDate}
        />

        {/* <Text style={styles.label}>Pagamento Recebido?</Text>
        <Switch
          value={received}
          onValueChange={setReceived}
          thumbColor={received ? '#2979FF' : '#ccc'}
          trackColor={{ false: '#ccc', true: '#A7C7FF' }}
        /> */}
        <ToggleRecebido value={received} onChange={setReceived} />

        <Button title="Salvar" 
                onPress={handleSubmit} 
                style={{ marginTop: 16 }} />

        <Button title="Voltar" 
                onPress={() => router.push('/Finance')} 
                variant="outline" 
                style={{ marginTop: 16 }} />
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
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
});