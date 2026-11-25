// src/components/CustomToast.tsx
import Feather from '@expo/vector-icons/Feather';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ToastConfig } from 'react-native-toast-message';

const { width } = Dimensions.get('window');

interface ToastCardProps {
  type: 'success' | 'error' | 'info';
  text1?: string;
  text2?: string;
  onPress?: () => void;
}

const configMap = {
  success: {
    icon: 'check-circle' as const,
    iconColor: '#10b981',
    iconBg: '#ecfdf5',
    accentColor: '#10b981',
  },
  error: {
    icon: 'alert-triangle' as const,
    iconColor: '#ef4444',
    iconBg: '#fef2f2',
    accentColor: '#ef4444',
  },
  info: {
    icon: 'info' as const,
    iconColor: '#3b82f6',
    iconBg: '#eff6ff',
    accentColor: '#3b82f6',
  },
};

function ToastCard({ type, text1, text2, onPress }: ToastCardProps) {
  const current = configMap[type] || configMap.info;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.card, { borderLeftColor: current.accentColor }]}
    >
      <View style={[styles.iconWrapper, { backgroundColor: current.iconBg }]}>
        <Feather name={current.icon} size={20} color={current.iconColor} />
      </View>

      <View style={styles.textContainer}>
        {text1 ? <Text style={styles.title}>{text1}</Text> : null}
        {text2 ? <Text style={styles.message}>{text2}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

export const toastConfig: ToastConfig = {
  success: ({ text1, text2, onPress }) => (
    <ToastCard type="success" text1={text1} text2={text2} onPress={onPress} />
  ),
  error: ({ text1, text2, onPress }) => (
    <ToastCard type="error" text1={text1} text2={text2} onPress={onPress} />
  ),
  info: ({ text1, text2, onPress }) => (
    <ToastCard type="info" text1={text1} text2={text2} onPress={onPress} />
  ),
};

const styles = StyleSheet.create({
  card: {
    width: Math.min(width - 32, 400),
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderLeftWidth: 5,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  message: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 18,
  },
});

