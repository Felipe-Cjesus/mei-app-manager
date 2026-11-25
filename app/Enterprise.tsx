import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { EnterpriseItem, useEnterprise } from '../contexts/EnterpriseContext';
import api from '../services/api';
import Button from '../src/components/Button';
import Header from '../src/components/HeaderSecundary';
import Input from '../src/components/Input';
import colors from '../src/theme/colors';
import { maskCnpj } from '../src/utils/masks';

export default function Enterprise() {
  const router = useRouter();
  const {
    enterprises,
    activeEnterprise,
    selectEnterprise,
    fetchEnterprises,
    loadingEnterprises,
  } = useEnterprise();

  const [submitting, setSubmitting] = useState(false);

  // ID da empresa em edição (se null, modo de criação)
  const [editingId, setEditingId] = useState<number | null>(null);

  // Campos do formulário
  const [company_name, setCompany_name] = useState('');
  const [company_id, setCompany_id] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [number, setNumber] = useState('');
  const [contact, setContact] = useState('');
  const [social_media, setSocial_media] = useState('');

  const pageTitle = 'Gestão de Empresas';

  const populateForm = (item: EnterpriseItem) => {
    setEditingId(item.id);
    setCompany_name(item.company_name || '');
    setCompany_id(maskCnpj(item.company_id || ''));
    setState(item.state || '');
    setCity(item.city || '');
    setAddress(item.address || '');
    setNumber(item.number || '');
    setContact(item.contact || '');
    setSocial_media(item.social_media || '');
  };

  useEffect(() => {
    // Ao abrir, pré-popula o formulário com a empresa ativa, se houver
    if (activeEnterprise && !editingId) {
      populateForm(activeEnterprise);
    }
  }, [activeEnterprise, editingId]);

  const handleStartNewEnterprise = () => {
    setEditingId(null);
    setCompany_name('');
    setCompany_id('');
    setState('');
    setCity('');
    setAddress('');
    setNumber('');
    setContact('');
    setSocial_media('');
  };

  const handleSaveEnterprise = async () => {
    if (!company_name.trim() || !company_id.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Campos obrigatórios!',
        text2: 'Nome da empresa e CNPJ são obrigatórios.',
      });
      return;
    }

    const payload = {
      company_name: company_name.trim(),
      company_id: company_id.trim(),
      state: state.trim() || null,
      city: city.trim() || null,
      address: address.trim() || null,
      number: number.trim() || null,
      contact: contact.trim() || null,
      social_media: social_media.trim() || null,
    };

    try {
      setSubmitting(true);

      if (editingId) {
        // Atualizar empresa existente
        const response = await api.put(`/enterprises/${editingId}`, payload);
        Toast.show({
          type: 'success',
          text1: 'Sucesso!',
          text2: 'Dados da empresa atualizados com sucesso ✅',
        });
        await fetchEnterprises();
        if (response.data?.data) {
          populateForm(response.data.data);
        }
      } else {
        // Cadastrar nova empresa (contador autônomo / multi-cliente)
        const response = await api.post('/enterprises', payload);
        Toast.show({
          type: 'success',
          text1: 'Sucesso!',
          text2: 'Nova empresa cadastrada com sucesso ✅',
        });
        await fetchEnterprises();
        if (response.data?.data) {
          await selectEnterprise(response.data.data);
          populateForm(response.data.data);
        }
      }
    } catch (error: any) {
      console.error('Erro ao salvar empresa:', error);
      const errorMsg =
        error?.response?.data?.message ||
        'Não foi possível salvar os dados da empresa. Verifique se o CNPJ é único.';
      Alert.alert('Erro ao salvar', errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title={pageTitle} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loadingEnterprises ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 32 }} />
        ) : (
          <>
            {/* Bloco de Empresas Cadastradas (Visão Contador / Multi-Empresa) */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                {enterprises.length > 0
                  ? `Empresas Cadastradas (${enterprises.length})`
                  : 'Nenhuma empresa cadastrada'}
              </Text>
              <TouchableOpacity
                style={styles.newButton}
                onPress={handleStartNewEnterprise}
              >
                <Text style={styles.newButtonText}>+ Nova Empresa</Text>
              </TouchableOpacity>
            </View>

            {enterprises.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.carouselContainer}
              >
                {enterprises.map((item) => {
                  const isEditingThis = editingId === item.id;
                  const isActiveInApp = activeEnterprise?.id === item.id;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.enterpriseCard,
                        isEditingThis && styles.enterpriseCardActive,
                      ]}
                      onPress={() => populateForm(item)}
                    >
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardCompanyName} numberOfLines={1}>
                          {item.company_name}
                        </Text>
                        {isActiveInApp && (
                          <View style={styles.activeTag}>
                            <Text style={styles.activeTagText}>Ativa no App</Text>
                          </View>
                        )}
                      </View>

                      <Text style={styles.cardCnpj}>CNPJ: {item.company_id}</Text>
                      {item.city && (
                        <Text style={styles.cardCity}>
                          {item.city}
                          {item.state ? ` - ${item.state}` : ''}
                        </Text>
                      )}

                      <View style={styles.cardActionsRow}>
                        <Text
                          style={[
                            styles.cardBadge,
                            isEditingThis ? styles.cardBadgeActive : styles.cardBadgeInactive,
                          ]}
                        >
                          {isEditingThis ? 'Editando' : 'Editar'}
                        </Text>

                        {!isActiveInApp && (
                          <TouchableOpacity
                            style={styles.setContextButton}
                            onPress={() => selectEnterprise(item)}
                          >
                            <Text style={styles.setContextButtonText}>
                              Tornar Ativa
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {/* Cabeçalho do Formulário */}
            <View style={styles.formStatusBanner}>
              <Text style={styles.formStatusTitle}>
                {editingId ? 'Editando Dados da Empresa' : 'Cadastrar Nova Empresa / Cliente'}
              </Text>
              {editingId && (
                <Text style={styles.formStatusSubtitle}>
                  {'Atualize os dados e clique em "Salvar Alterações".'}
                </Text>
              )}
            </View>

            <Input
              label="Nome da Empresa *"
              value={company_name}
              onChangeText={setCompany_name}
              placeholder="Ex: Minha Empresa MEI LTDA"
            />

            <Input
              label="CNPJ *"
              value={company_id}
              onChangeText={(text) => setCompany_id(maskCnpj(text))}
              placeholder="00.000.000/0000-00"
              keyboardType="numeric"
              maxLength={18}
            />

            <Input
              label="Estado (UF)"
              value={state}
              onChangeText={setState}
              placeholder="Ex: SP"
              maxLength={2}
            />

            <Input
              label="Cidade"
              value={city}
              onChangeText={setCity}
              placeholder="Ex: São Paulo"
            />

            <Input
              label="Logradouro / Rua"
              value={address}
              onChangeText={setAddress}
              placeholder="Ex: Av. Paulista"
            />

            <Input
              label="Número"
              value={number}
              onChangeText={setNumber}
              placeholder="Ex: 1000"
            />

            <Input
              label="Contato / Telefone"
              value={contact}
              onChangeText={setContact}
              placeholder="Ex: (11) 99999-9999"
              keyboardType="phone-pad"
            />

            <Input
              label="Redes Sociais / Site (opcional)"
              value={social_media}
              onChangeText={setSocial_media}
              placeholder="Ex: @empresa ou www.empresa.com"
            />

            <Button
              title={editingId ? 'Salvar Alterações' : 'Cadastrar Empresa'}
              onPress={handleSaveEnterprise}
              loading={submitting}
              style={{ marginTop: 16 }}
            />

            {editingId && (
              <Button
                title="Cadastrar Outra Empresa (+)"
                onPress={handleStartNewEnterprise}
                variant="outline"
                style={{ marginTop: 12 }}
              />
            )}

            <Button
              title="Voltar"
              onPress={() => router.back()}
              variant="outline"
              style={{ marginTop: 12, marginBottom: 32 }}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  newButton: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  newButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  carouselContainer: {
    marginBottom: 20,
  },
  enterpriseCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginRight: 12,
    width: 240,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  enterpriseCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#f0f7ff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardCompanyName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
    marginRight: 6,
  },
  activeTag: {
    backgroundColor: colors.primary,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  activeTagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  cardCnpj: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  cardCity: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  cardBadge: {
    fontSize: 11,
    fontWeight: '600',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  cardBadgeActive: {
    backgroundColor: colors.primary,
    color: '#fff',
  },
  cardBadgeInactive: {
    backgroundColor: '#eee',
    color: '#555',
  },
  setContextButton: {
    backgroundColor: '#e3f2fd',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  setContextButtonText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  formStatusBanner: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  formStatusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primaryDark,
  },
  formStatusSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
});
