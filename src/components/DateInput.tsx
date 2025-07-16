// components/DateInput.tsx
import { format } from 'date-fns';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import colors from '../theme/colors';

type DateInputProps = {
  label?: string;
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
};

export default function DateInput({ label, value, onChange, placeholder = 'Selecionar data' }: DateInputProps) {
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleConfirm = (date: Date) => {
    setPickerVisible(false);
    onChange(date);
    setIsFocused(false); // fecha o foco após seleção
  };

  const handleCancel = () => {
    setPickerVisible(false);
    setIsFocused(false); // remove o foco se cancelar
  };

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={[
          styles.input,
          isFocused && { borderColor: colors.primary, borderWidth: 2 },
        ]}
        onPress={() => {
          setPickerVisible(true);
          setIsFocused(true); // aplica o foco visual
        }}
      >
        <Text style={value ? styles.text : styles.placeholder}>
          {value ? format(value, 'dd/MM/yyyy') : placeholder}
        </Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isPickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        confirmTextIOS="Confirmar"
        cancelTextIOS="Cancelar"
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        locale="pt-BR"
        themeVariant="dark" // ajuda no Android, limitado no iOS
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 16,
    color: '#000',
  },
  placeholder: {
    fontSize: 16,
    color: '#999',
  },
});