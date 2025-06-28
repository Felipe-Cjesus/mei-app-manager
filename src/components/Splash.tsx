// src/components/Splash.tsx
import React from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function Splash() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/mei-manager-splash.png')}
        style={styles.logo}
        resizeMode="cover"
      />
      {/* <ActivityIndicator size="large" color="#3498db" style={{ marginTop: 20 }} /> */}
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
    width: windowWidth,
    height: windowHeight,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
});