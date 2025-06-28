// components/TextView.tsx
import React from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';

type Variant =
  | 'default'
  | 'title'
  | 'subtitle'
  | 'muted'
  | 'primary'
  | 'danger'
  | 'success';

type TextViewProps = {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  bold?: boolean;
  variant?: Variant;
  style?: TextStyle;
};

export default function TextView({
  children,
  size = 'md',
  bold = false,
  variant = 'default',
  style,
}: TextViewProps) {
  const sizeStyle = {
    sm: styles.sm,
    md: styles.md,
    lg: styles.lg,
    xl: styles.xl,
  }[size];

  const variantStyle = {
    default: styles.default,
    title: styles.title,
    subtitle: styles.subtitle,
    muted: styles.muted,
    primary: styles.primary,
    danger: styles.danger,
    success: styles.success,
  }[variant];

  return (
    <Text style={[sizeStyle, variantStyle, bold && styles.bold, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  sm: { fontSize: 12 },
  md: { fontSize: 16 },
  lg: { fontSize: 22 },
  xl: { fontSize: 24 },

  bold: { fontWeight: '700' },

  default: { color: '#1A1C2C' }, // Azul escuro
  title: { color: '#2979FF', fontSize: 24, fontWeight: '700' }, // Azul forte
  subtitle: { color: '#1565C0', fontSize: 18 },
  muted: { color: '#90A4AE' }, // Azul acinzentado
  primary: { color: '#2979FF' },
  danger: { color: '#D32F2F' },
  success: { color: '#388E3C' },
});