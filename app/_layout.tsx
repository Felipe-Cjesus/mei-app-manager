// app/_layout.tsx
import { Redirect, Slot, useSegments } from 'expo-router';
import React from 'react';
import Toast from 'react-native-toast-message';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import Splash from '../src/components/Splash';

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate />
      <Toast />
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