// app/_layout.tsx
import { Redirect, Slot, useSegments } from 'expo-router';
import { LogBox } from 'react-native';
import Toast from 'react-native-toast-message';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { EnterpriseProvider } from '../contexts/EnterpriseContext';
import Splash from '../src/components/Splash';

// Suprime o warning de depreciação do onChange mantido pela lib react-native-modal-datetime-picker no terminal e LogBox
if (__DEV__) {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('DateTimePicker: `onChange` is deprecated')
    ) {
      return;
    }
    originalWarn(...args);
  };
}

// Ignora aviso de depreciação do onChange no DateTimePicker mantido internamente pelo react-native-modal-datetime-picker
LogBox.ignoreLogs([
  'DateTimePicker: `onChange` is deprecated',
]);

export default function RootLayout() {
  return (
    <AuthProvider>
      <EnterpriseProvider>
        <AuthGate />
        <Toast />
      </EnterpriseProvider>
    </AuthProvider>
  );
}

function AuthGate() {
  const { user, loading } = useAuth();
  const segments = useSegments();

  const isInAuthGroup = segments[0] === '(auth)';

  if (loading) {
    // return (
    //   <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    //     <Text>Carregando...</Text>
    //   </View>
    // );
    if (loading) {
      return <Splash />;
    }
  }

  if (!user && !isInAuthGroup) {
    // redireciona para login se não estiver autenticado
    return <Redirect href="/(auth)/login" />;
  }

  return <Slot />;
}