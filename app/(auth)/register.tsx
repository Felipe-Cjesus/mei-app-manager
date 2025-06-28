// app/register.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, View } from 'react-native';
import api from '../../services/api';
import Button from '../../src/components/Button';
import Input from '../../src/components/Input';
import TextView from '../../src/components/TextView';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  // const [companyId, setCompanyId] = useState('');
  // const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (password !== confirmation) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    try {
      setLoading(true);
      await api.post('/register', {
        name,
        email,
        password,
        password_confirmation: confirmation,
      });

      Alert.alert('Sucesso', 'Cadastro realizado com sucesso');
      router.replace('/');
    } catch (err: any) {
      console.error(err);
      Alert.alert('Erro', err?.response?.data?.message || 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/mei-manager-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <TextView size="xl" bold style={styles.title}>
        Criar Conta
      </TextView>

      <Input 
        label="Nome" 
        value={name} 
        onChangeText={setName} 
      />
      {/* <Input 
        label="Nome da empresa" 
        value={companyId} 
        onChangeText={setCompanyId} 
      />
      <Input 
        label="CNPJ" 
        value={companyName} 
        onChangeText={setCompanyName} 
      /> */}
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <Input
        label="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Input
        label="Confirme a senha"
        value={confirmation}
        onChangeText={setConfirmation}
        secureTextEntry
      />

      <Button
        title="Cadastrar"
        onPress={handleRegister}
        loading={loading}
        style={{ marginTop: 16 }}
      />

      <Button
        title="Voltar para login"
        onPress={() => router.push('/login')} 
        variant="outline"
        style={{ marginTop: 16 }}
      />  
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  logo: {
    alignSelf: 'center',
    width: 200,
    height: 200,
    marginBottom: 24,
  },
});
