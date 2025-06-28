// app/register.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import api from '../../services/api';
import Button from '../../src/components/Button';
import Input from '../../src/components/Input';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
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
      <Text style={styles.title}>Criar Conta</Text>

      <Input
        placeholder="Nome"
        value={name}
        onChangeText={setName}
      />
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <Input
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Input
        placeholder="Confirme a senha"
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
      title="Voltar ao login" 
      onPress={() => router.push('/login')} 
      variant="outline" 
      style={{ marginTop: 12 }} 
    />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
});
