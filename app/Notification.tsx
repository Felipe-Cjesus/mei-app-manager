import { Text, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import Button from '../src/components/Button';

export default function Alert() {
  const { logout } = useAuth();

  return (
    <View style={{ padding: 20 }}>
      <Text>Notificações 🔔</Text>
      <Button title="Sair" onPress={logout} />
    </View>
  );
}
