import { Text, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function Enterprise() {
  const { logout } = useAuth();

  return (
    <View style={{ padding: 20 }}>
      <Text>Empresa 🏢</Text>
    </View>
  );
}
