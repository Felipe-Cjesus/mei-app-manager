import { Text, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function Invoice() {
  const { logout } = useAuth();

  return (
    <View style={{ padding: 20 }}>
      <Text>NOTAS FISCAIS! 📄</Text>
    </View>
  );
}
