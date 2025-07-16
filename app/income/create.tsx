import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import Button from '../../src/components/Button';
import DateInput from '../../src/components/DateInput';
import Header from '../../src/components/Header';
import Input from '../../src/components/Input';
import ToggleRecebido from '../../src/components/ToggleRecebido';

export default function CreateIncome() {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dateReceived, setDateReceived] = useState(new Date());
  const router = useRouter();
  const [received, setReceived] = useState(false);

  const handleSubmit = () => {
    // Enviar dados da receita à API
    Toast.show({
        type: 'success',
        text1: 'Sucesso!',
        text2: 'Dados salvos com sucesso ✅',
      });
    console.log('📤 Enviando:', { description, amount, dateReceived , received});
  };

  return (
    <View style={styles.container}>
      <Header />

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
          value={dateReceived}
          onChange={setDateReceived}
        />

        {/* <Text style={styles.label}>Pagamento Recebido?</Text>
        <Switch
          value={received}
          onValueChange={setReceived}
          thumbColor={received ? '#2979FF' : '#ccc'}
          trackColor={{ false: '#ccc', true: '#A7C7FF' }}
        /> */}
        <ToggleRecebido value={received} onChange={setReceived} />

        <Button title="Salvar" onPress={handleSubmit} style={{ marginTop: 16 }} />

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
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
});