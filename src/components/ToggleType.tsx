// components/ToggleType.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../theme/colors';

type ExpenseType = 'manual' | 'nota_fiscal';

type Props = {
  value: ExpenseType;
  onChange: (val: ExpenseType) => void;
};

export default function ToggleType({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tipo</Text>
      <View style={styles.toggleGroup}>
        <TouchableOpacity
          style={[styles.toggleOption, value === 'manual' && styles.active]}
          onPress={() => onChange('manual')}
        >
          <Text style={[styles.toggleText, value === 'manual' && styles.activeText]}>Manual</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleOption, value === 'nota_fiscal' && styles.active]}
          onPress={() => onChange('nota_fiscal')}
        >
          <Text style={[styles.toggleText, value === 'nota_fiscal' && styles.activeText]}>Nota Fiscal</Text>
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
