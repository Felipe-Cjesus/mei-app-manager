import { Text, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function Account() {
  const { logout } = useAuth();

  return (
    <View style={{ padding: 20 }}>
      <Text>Conta 👤</Text>
    </View>
  );
}
