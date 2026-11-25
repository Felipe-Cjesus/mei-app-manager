import Feather from '@expo/vector-icons/Feather';
import { format } from 'date-fns';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Keyboard,
    Platform,
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
import ToggleType from '../../src/components/ToggleType';
import colors from '../../src/theme/colors';
import { currencyToNumber, maskCurrency } from '../../src/utils/masks';

export default function CreateExpense() {
  const { activeEnterprise } = useEnterprise();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const router = useRouter();
  const [type, setType] = useState<'manual' | 'nota_fiscal'>('manual');
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

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log("Seleção cancelada");
        return;
      }

      const fileImp = result.assets[0];

      if (fileImp.size && fileImp.size > 2 * 1024 * 1024) {
        Toast.show({
          type: 'error',
          text1: 'Arquivo muito grande',
          text2: 'O arquivo deve ter no máximo 2MB.',
        });
        return;
      }

      setFile(fileImp);
    } catch (error) {
      console.error('Erro ao selecionar arquivo:', error);
    }
  };

  const handleSubmit = async () => {
    // Validar se há empresa ativa selecionada
    if (!activeEnterprise?.id) {
      Toast.show({
        type: 'error',
        text1: 'Empresa Obrigatória',
        text2: 'Cadastre ou selecione uma empresa antes de registrar despesas.',
      });
      router.push('/Enterprise');
      return;
    }

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
    formData.append('amount', String(currencyToNumber(amount)));
    formData.append('date', formatDateToDatabase(date));
    formData.append('type', type);
    formData.append('enterprise_id', String(activeEnterprise.id));

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
      Toast.show({
        type: 'success',
        text1: 'Sucesso!',
        text2: 'Despesa cadastrada com sucesso ✅',
      });
      setDescription('');
      setAmount('');
      setDate(new Date());
      setType('manual');
      setFile(null);
    } catch (error: any) {
      console.error('Erro ao salvar despesa:', error);
      const msg = error?.response?.data?.message || 'Não foi possível salvar a despesa.';
      Toast.show({
        type: 'error',
        text1: 'Erro!',
        text2: msg,
      });
    }
  };

  const formatDateToDatabase = (dateString : any) => {
    const date = new Date(dateString);
    return format(date, 'yyyy-MM-dd');  // Formata como "2025-09-21"
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
          <Text style={styles.title}>Nova Despesa</Text>

          {/* Banner de alerta caso não haja empresa ativa */}
          {!activeEnterprise ? (
            <View style={styles.warningBanner}>
              <Feather name="alert-triangle" size={20} color="#d97706" style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.warningTitle}>Nenhuma Empresa Selecionada</Text>
                <Text style={styles.warningText}>
                  É necessário cadastrar ou selecionar uma empresa para registrar despesas.
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
            label="Descrição"
            value={description}
            onChangeText={setDescription}
            placeholder="Ex: Pagamento de despesa"
          />

          <Input
            label="Valor (R$)"
            value={amount}
            onChangeText={(text) => setAmount(maskCurrency(text))}
            placeholder="R$ 0,00"
            keyboardType="numeric"
          />

          <DateInput
            label="Data de recebimento"
            value={date}
            onChange={setDate}
          />

          <ToggleType value={type} onChange={setType} />

          <TouchableOpacity style={styles.fileButton} onPress={handlePickFile}>
            <Text style={styles.fileButtonText}>
              {file ? `📎 ${file.name}` : 'Selecionar arquivo 📎'}
            </Text>
          </TouchableOpacity>

          <Button title="Salvar" 
                  onPress={handleSubmit} 
                  style={{ marginTop: 16 }} />
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