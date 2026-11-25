// app/register.tsx
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import api from '../../services/api';
import Button from '../../src/components/Button';
import Input from '../../src/components/Input';
import TextView from '../../src/components/TextView';
import colors from '../../src/theme/colors';

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
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push('/login')}
        activeOpacity={0.7}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Feather name="arrow-left" size={24} color={colors.primary} />
      </TouchableOpacity>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
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

          <TouchableOpacity
            onPress={() => router.push('/login')}
            style={{ marginTop: 16, alignItems: 'center' }}
          >
            <TextView size="sm" variant="muted">
              Já possui uma conta? Faça login
            </TextView>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
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
