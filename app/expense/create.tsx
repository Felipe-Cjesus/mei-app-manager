// import { Picker } from '@react-native-picker/picker';
import { format } from 'date-fns';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import api from '../../services/api';
import Button from '../../src/components/Button';
import DateInput from '../../src/components/DateInput';
import Header from '../../src/components/HeaderSecundary';
import Input from '../../src/components/Input';
import ToggleType from '../../src/components/ToggleType';
import colors from '../../src/theme/colors';

export default function CreateExpense() {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const router = useRouter();
  const [type, setType] = useState<'Manual' | 'Nota fiscal'>('Manual');
  const [file, setFile] = useState<any>(null);
  const pageTitle = 'Inclusão de Despesa';

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
            type: [
            'application/pdf',
            'application/xml',
            'image/jpeg',
            'image/png',
            ],
            copyToCacheDirectory: true,
        });

        if (result.canceled) {
            console.log("Seleção cancelada");
            return;
        }

        const fileImp = result.assets[0];

        if (fileImp.size && fileImp.size > 2 * 1024 * 1024) {
            Alert.alert('Erro', 'O arquivo deve ter no máximo 2MB.');
            return;
        }
    
        setFile(result);
    } catch (error) {
      console.error('Erro ao selecionar arquivo:', error);
    }
  };

  const handleSubmit = async () => {

    // Validar campos
    if (!description || !amount || !date) {
      Toast.show({
        type: 'error',
        text1: 'Erro!',
        text2: 'Todos os campos obrigatórios devem ser preenchidos.',
      });
      return;
    }

    const formData = new FormData();
    formData.append('description', description);
    formData.append('amount', amount);
    formData.append('date', formatDateToDatabase(date));
    formData.append('type', type);

    if (file) {
        formData.append('file', {
          uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
          name: file.name,
          type: file.mimeType || 'application/octet-stream',
        } as any);
    }

    // Enviar dados para a API usando axios
    try {
        await api.post('/expenses', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        Alert.alert('Sucesso', 'Despesa cadastrada com sucesso!');
        setDescription('');
        setAmount('');
        setDate(new Date());
        setType('Manual');
        setFile(null);
      } catch (error) {
        console.error('Erro ao salvar despesa:', error);
        Alert.alert('Erro', 'Não foi possível salvar a despesa.');
      }
  };

  const formatDateToDatabase = (dateString : any) => {
    const date = new Date(dateString);
    return format(date, 'yyyy-MM-dd');  // Formata como "2025-09-21"
  };

  return (
    <View style={styles.container}>
      <Header title={pageTitle} />
      <View style={styles.content}>
        <Text style={styles.title}>Nova Despesa</Text>

        <Input
          label="Descrição"
          value={description}
          onChangeText={setDescription}
          placeholder="Ex: Pagamento de despesa"
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

        {/* <Text style={styles.label}>Tipo</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={type} onValueChange={(value) => setType(value)}>
            <Picker.Item label="Manual" value="Manual" style={styles.pickerItem}/>
            <Picker.Item label="Nota fiscal" value="Nota fiscal" style={styles.pickerItem}/>
          </Picker>
        </View> */}

        <ToggleType value={type} onChange={setType} />

        <TouchableOpacity style={styles.fileButton} onPress={handlePickFile}>
          <Text style={styles.fileButtonText}>
            {file ? `📎 ${file.name}` : 'Selecionar arquivo 📎'}
          </Text>
        </TouchableOpacity>

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
  pickerContainer: {
    backgroundColor: '#ddd',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 4,
  },
  pickerItem: {
    color: 'blue',
    backgroundColor: 'lightgray',
  },
  fileButton: {
    backgroundColor: colors.border,
    padding: 12,
    borderRadius: 6,
    marginTop: 12,
    alignItems: 'center',
  },
  fileButtonText: { color: '#333', fontWeight: '600' },
  submitButton: {
    backgroundColor: colors.primaryDark,
    padding: 14,
    borderRadius: 6,
    marginTop: 20,
    alignItems: 'center',
  },
});