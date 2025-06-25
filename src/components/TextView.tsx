// components/TextView.tsx
import React from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';

type TextViewProps = {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  bold?: boolean;
  style?: TextStyle;
  color?: string;
};

export default function TextView({
  children,
  size = 'md',
  bold = false,
  style,
  color = '#333',
}: TextViewProps) {
  const sizeStyle = {
    sm: styles.sm,
    md: styles.md,
    lg: styles.lg,
  }[size];

  return (
    <Text
      style={[
        sizeStyle,
        bold && styles.bold,
        { color },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  sm: {
    fontSize: 12,
  },
  md: {
    fontSize: 16,
  },
  lg: {
    fontSize: 22,
  },
  bold: {
    fontWeight: 'bold',
  },
});