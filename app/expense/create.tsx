import Feather from '@expo/vector-icons/Feather';
import { format } from 'date-fns';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
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
import DateInput from '../../src/components/DateInput';
import Header from '../../src/components/HeaderSecundary';
import Input from '../../src/components/Input';
import ToggleType from '../../src/components/ToggleType';
import { currencyToNumber, maskCurrency } from '../../src/utils/masks';

export default function CreateExpense() {
  const { activeEnterprise } = useEnterprise();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [type, setType] = useState<'manual' | 'nota_fiscal'>('manual');
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
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
    if (!activeEnterprise?.id) {
      Toast.show({
        type: 'error',
        text1: 'Empresa Obrigatória',
        text2: 'Cadastre ou selecione uma empresa antes de registrar despesas.',
      });
      router.push('/Enterprise');
      return;
    }

    if (!description.trim() || !amount.trim() || !date) {
      Toast.show({
        type: 'error',
        text1: 'Campos Obrigatórios',
        text2: 'Preencha a descrição, valor e data da despesa.',
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

      const formData = new FormData();
      formData.append('description', description.trim());
      formData.append('amount', String(numericAmount));
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

      router.push('/expense/list');
    } catch (error: any) {
      console.error('Erro ao salvar despesa:', error);
      const msg = error?.response?.data?.message || 'Não foi possível salvar a despesa.';
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
              <View style={styles.enterpriseBadgeIcon}>
                <Feather name="briefcase" size={14} color="#f97316" />
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
                <Feather name="arrow-up-right" size={24} color="#f97316" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Nova Despesa</Text>
                <Text style={styles.cardSubtitle}>
                  Custos e compras necessárias para o funcionamento da sua atividade
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Input
              label="Descrição da Despesa *"
              value={description}
              onChangeText={setDescription}
              placeholder="Ex: Aluguel, Compra de Mercadoria, Internet..."
            />

            <Input
              label="Valor Pago (R$) *"
              value={amount}
              onChangeText={(text) => setAmount(maskCurrency(text))}
              placeholder="R$ 0,00"
              keyboardType="numeric"
            />

            <DateInput
              label="Data da Despesa *"
              value={date}
              onChange={setDate}
            />

            <ToggleType value={type} onChange={setType} />

            {/* Upload de Comprovante ou NF */}
            <View style={styles.fileSection}>
              <Text style={styles.fileSectionLabel}>Comprovante ou Documento Fiscal (Opcional)</Text>
              <TouchableOpacity
                style={[styles.uploadBox, file && styles.uploadBoxSelected]}
                activeOpacity={0.75}
                onPress={handlePickFile}
              >
                <View style={styles.uploadIconCircle}>
                  <Feather
                    name={file ? 'check-circle' : 'upload-cloud'}
                    size={20}
                    color={file ? '#10b981' : '#f97316'}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.uploadTitle} numberOfLines={1}>
                    {file ? file.name : 'Selecionar anexo (PDF, XML ou Imagem)'}
                  </Text>
                  <Text style={styles.uploadSubtitle}>
                    {file
                      ? `${(file.size ? (file.size / 1024).toFixed(0) : '0')} KB • Toque para alterar`
                      : 'Tamanho máximo permitido: 2MB'}
                  </Text>
                </View>
                {file && (
                  <TouchableOpacity
                    style={styles.clearFileBtn}
                    onPress={() => setFile(null)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Feather name="x" size={16} color="#94a3b8" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            </View>

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
                  <Text style={styles.submitButtonText}>Salvar Despesa</Text>
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
    backgroundColor: '#fff7ed',
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
    backgroundColor: '#fff7ed',
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

  // Seção de Anexo
  fileSection: {
    marginTop: 16,
    marginBottom: 8,
  },
  fileSectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  uploadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 14,
  },
  uploadBoxSelected: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
    borderStyle: 'solid',
  },
  uploadIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  uploadTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  uploadSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  clearFileBtn: {
    padding: 6,
    marginLeft: 6,
  },

  // Botão de Envio
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 24,
    shadowColor: '#f97316',
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
