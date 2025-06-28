// src/components/Splash.tsx
import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

export default function Splash() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/mei-manager-splash.png')}
        // style={styles.logo}
        resizeMode="cover"
      />
      <Text style={styles.title}>MEI Manager</Text>
      <ActivityIndicator size="large" color="#3498db" style={{ marginTop: 20 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
});