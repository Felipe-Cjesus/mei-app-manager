import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import Button from '../src/components/Button';

export default function Enterprise() {
  const { logout } = useAuth();
  const router = useRouter();

  return (
    <View style={{ padding: 20 }}>
      <Text>Empresa 🏢</Text>
      <Button title="Sair" onPress={logout} />
      <Button title="Voltar" onPress={() => router.back()} />
    </View>
  );
}
