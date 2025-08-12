// components/ToggleType.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../theme/colors';

type Props = {
  value: string;
  onChange: (val: "Manual" | "Nota fiscal") => void;
};

export default function ToggleRecebido({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tipo</Text>
      <View style={styles.toggleGroup}>
        <TouchableOpacity
          style={[styles.toggleOption, value==='Manual' && styles.active]}
          onPress={() => onChange('Manual')}
        >
          <Text style={[styles.toggleText, value && styles.activeText]}>Manual</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleOption, value==='Nota fiscal' && styles.active]}
          onPress={() => onChange('Nota fiscal')}
        >
          <Text style={[styles.toggleText, !value && styles.activeText]}>Nota Fiscal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  toggleGroup: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
  },
  active: {
    backgroundColor: colors.primaryLight,
  },
  activeText: {
    color: colors.primary,
  },
});