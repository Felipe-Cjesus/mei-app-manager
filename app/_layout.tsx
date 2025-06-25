import { Stack } from 'expo-router';
import React from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';


export default function RootLayout() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}

function AppLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // ou splash
  }

  if (!user) {
    return (
      <Stack>
        <Stack.Screen
          name="(auth)/login"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(auth)/register"
          options={{ headerShown: false }}
        />
      </Stack>
    );
  }

  return <Stack />;
}