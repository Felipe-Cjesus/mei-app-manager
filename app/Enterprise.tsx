import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Button from '../src/components/Button';
import Header from '../src/components/HeaderSecundary';
import Input from '../src/components/Input';

export default function Enterprise() {
  const { logout } = useAuth();
  const router = useRouter();

  const [company_name, setCompany_name] = useState('');
  const [company_id, setCompany_id] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [number, setnumber] = useState('');
  const [contact, setContact] = useState('');
  const [social_media, setSocial_media] = useState('');
  const pageTitle = 'Dados da Empresa';

  const handleEnterprise = () => {

    // Validar campos
    if (!company_name || !company_id) {
      Toast.show({
        type: 'error',
        text1: 'Erro!',
        text2: 'Nome da empresa e CNPJ são obrigatórios e devem ser preenchidos.',
      });
      return;
    }

    // Enviar dados para API
    const data = {
      company_name,
      company_id,
      state,
      city,
      address,
      number,
      contact,
      social_media
    };

    // Enviar dados para a API usando axios
    api.post('/enterprises', data)
    .then(response => {
      Toast.show({
        type: 'success',
        text1: 'Sucesso!',
        text2: 'Empresa salva com sucesso ✅',
      });

      // Limpar campos
      setCompany_name('');
      setCompany_id('');
      setState('');
      setCity('');
      setAddress('');
      setnumber('');
      setContact('');
      setSocial_media('');

      console.log('📤 Dados enviados:', response.data);
    })
    .catch(error => {
      Toast.show({
        type: 'error',
        text1: 'Erro!',
        text2: 'Ocorreu um erro ao salvar a empresa.',
      });
      console.error('Erro ao enviar dados:', error);
    });

    console.log('📤 Dados enviados:', data);
  };

  return (
    <View style={styles.container}>
      <Header title={pageTitle} />
      <View style={styles.content}>
        <Input
          label="Nome da empresa"
          value={company_name}
          onChangeText={setCompany_name}
          placeholder="Nome da empresa"
        />
        <Input
          label="CNPJ"
          value={company_id}
          onChangeText={setCompany_id}
          placeholder="000.000.000/0000-00"
        />

        <Input 
          label="Estado"
          value={state} 
          onChangeText={setState}
        />
        <Input 
          label="Cidade"
          value={city} 
          onChangeText={setCity}
        />
        <Input 
          label="Rua"
          value={address} 
          onChangeText={setAddress}
        />
        <Input 
          label="Número"
          value={number} 
          onChangeText={setnumber}
        />
        <Input 
          label="Contato"
          value={contact} 
          onChangeText={setContact}
        />
        {/* <Input 
          label="Redes Sociais"
          value={social_media} 
          onChangeText={setSocial_media}
        /> */}

        <Button
          title="Salvar"
          onPress={handleEnterprise}
          style={{ marginTop: 16 }}
        />

        <Button
          title="Voltar"
          onPress={() => router.back()} 
          variant="outline"
          style={{ marginTop: 16 }}
        />  
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