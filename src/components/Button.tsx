import React from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import colors from '../theme/colors';

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
    if (variant === 'primary') return colors.primaryBackgroundButton;
    if (variant === 'secondary') return colors.secundaryBackgroundButton;
    return 'transparent';
  };

  const getTextColor = () => {
    if (variant === 'outline') return colors.primaryBackgroundButton;;
    return '#ffffff';
  };

  const getBorder = () => {
    if (variant === 'outline') return { borderWidth: 1.5, borderColor: colors.primaryBackgroundButton };
    return {};
  };

  const getShadow = () => {
    if (variant === 'outline') return {};

    return Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    });
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: getBackgroundColor() },
        getBorder(),
        getShadow(),
        pressed && !disabled && { opacity: 0.85 },
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
