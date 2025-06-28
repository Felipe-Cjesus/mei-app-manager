import { Text, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../src/components/Button';

export default function Home() {
  const { logout } = useAuth();

  return (
    <View style={{ padding: 20 }}>
      <Text>Você está logado! 👋</Text>
      <Button title="Sair" onPress={logout} />
    </View>
  );
}
