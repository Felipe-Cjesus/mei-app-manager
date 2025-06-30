import { Text, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../src/components/Button';

export default function Finance() {
  const { logout } = useAuth();

  return (
    <View style={{ padding: 20 }}>
      <Text>Gráficos 📊</Text>
      <Button title="Sair" onPress={logout} />
    </View>
  );
}
