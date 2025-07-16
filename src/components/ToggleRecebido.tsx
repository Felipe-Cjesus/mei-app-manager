// components/ToggleRecebido.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../theme/colors';

type Props = {
  value: boolean;
  onChange: (val: boolean) => void;
};

export default function ToggleRecebido({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Recebido?</Text>
      <View style={styles.toggleGroup}>
        <TouchableOpacity
          style={[styles.toggleOption, value && styles.active]}
          onPress={() => onChange(true)}
        >
          <Text style={[styles.toggleText, value && styles.activeText]}>Sim</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleOption, !value && styles.active]}
          onPress={() => onChange(false)}
        >
          <Text style={[styles.toggleText, !value && styles.activeText]}>Não</Text>
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