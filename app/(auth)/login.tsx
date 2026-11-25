import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Image
          source={require('../../assets/images/mei-manager-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <TextView size="xl" bold style={styles.title}>
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

        <Button
          title="Criar conta"
          onPress={() => router.push('/(auth)/register')}
          variant="outline"
          style={{ marginTop: 12 }}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    marginBottom: 145,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
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