import { Text, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function Finance() {
  const { logout } = useAuth();

  return (
    <View style={{ padding: 20 }}>
      <Text>Gerenciador Financeiro 💰</Text>
    </View>
  );
}
