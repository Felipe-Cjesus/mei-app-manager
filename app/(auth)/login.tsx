import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import Button from '../../src/components/Button';
import Input from '../../src/components/Input';
import TextView from '../../src/components/TextView';

import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Atenção', 'Informe e-mail e senha.');
    }

    try {
        console.log('🟢 EMAIL', email);
        console.log('🟢 SENHA', password);

      setLoading(true);
      await login(email, password);
      router.replace('/');
    } catch (error) {
      console.error(error);
      
      Alert.alert('Erro', 'Login inválido. Verifique seus dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextView size="lg" bold style={styles.title}>
        Bem-vindo de volta 👋
      </TextView>

      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="seuemail@exemplo.com"
        keyboardType="email-address"
      />

      <Input
        label="Senha"
        value={password}
        onChangeText={setPassword}
        placeholder="Sua senha"
        secureTextEntry
      />

      <Button
        title="Entrar"
        onPress={handleLogin}
        loading={loading}
        variant="primary"
      />

      {/* Se quiser adicionar botão de cadastros */}
      <Button 
        title="Criar conta" 
        onPress={() => router.push('/register')} 
        variant="outline" 
        style={{ marginTop: 12 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f5f6fa',
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
});