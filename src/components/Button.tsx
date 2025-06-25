import React from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    TextStyle,
    ViewStyle,
} from 'react-native';

type Variant = 'primary' | 'secondary' | 'outline';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const getBackgroundColor = () => {
    if (variant === 'primary') return '#2e86de';
    if (variant === 'secondary') return '#6c5ce7';
    if (variant === 'outline') return 'transparent';
    return '#2e86de';
  };

  const getTextColor = () => {
    if (variant === 'outline') return '#2e86de';
    return '#fff';
  };

  const getBorder = () => {
    if (variant === 'outline') return { borderWidth: 1, borderColor: '#2e86de' };
    return {};
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: getBackgroundColor() },
        getBorder(),
        pressed && !disabled && { opacity: 0.8 },
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  disabled: {
    opacity: 0.6,
  },
});