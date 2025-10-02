// components/TogglePaymentStatus.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../theme/colors';

type StatusType = 'paid' | 'pending' | 'exempt';

type Props = {
  value: StatusType;
  onChange: (val: StatusType) => void;
};

export default function TogglePaymentStatus({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Status</Text>
      <View style={styles.toggleGroup}>
        <TouchableOpacity
          style={[styles.toggleOption, value === 'paid' && styles.active]}
          onPress={() => onChange('paid')}
        >
          <Text
            style={[
              styles.toggleText,
              value === 'paid' && styles.activeText,
            ]}
          >
            Pago
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleOption, value === 'pending' && styles.active]}
          onPress={() => onChange('pending')}
        >
          <Text
            style={[
              styles.toggleText,
              value === 'pending' && styles.activeText,
            ]}
          >
            Pendente
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleOption, value === 'exempt' && styles.active]}
          onPress={() => onChange('exempt')}
        >
          <Text
            style={[
              styles.toggleText,
              value === 'exempt' && styles.activeText,
            ]}
          >
            Isento
          </Text>
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