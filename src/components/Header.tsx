// components/Header.tsx
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../theme/colors'; // Paleta azul personalizada

type HeaderProps = {
  companyName?: string;
  companyId?: string;
  onNotificationPress?: () => void;
  onSettingsPress?: () => void;
};

export default function Header({
  companyName = 'MEI Manager',
  companyId = 'CNPJ 123456789',
  onNotificationPress,
  onSettingsPress,
}: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.title}>{companyName}</Text>
        <View style={styles.icons}>
          <TouchableOpacity onPress={onNotificationPress} style={styles.iconButton}>
            <Feather name="bell" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onSettingsPress} style={styles.iconButton}>
            <Feather name="user" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Aqui você pode incluir mais elementos no cabeçalho futuramente */}
      <Text style={styles.text}>{companyId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    paddingTop: 60,
    paddingBottom: 258,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  text: {
    fontSize: 18,
    color: '#fff',
  },
  icons: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    marginLeft: 12,
  },
});
