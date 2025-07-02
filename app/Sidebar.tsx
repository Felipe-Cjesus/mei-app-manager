// components/Sidebar.tsx
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity
} from 'react-native';
import colors from '../src/theme/colors';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.75;

type SidebarProps = {
  visible: boolean;
  onClose: () => void;
  onAccountPress: () => void;
  onEnterprisePress: () => void;
  onLogout: () => void;
};

export default function Sidebar({
  visible,
  onClose,
  onAccountPress,
  onEnterprisePress,
  onLogout,
}: SidebarProps) {
  const slideAnim = useRef(new Animated.Value(SIDEBAR_WIDTH)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SIDEBAR_WIDTH,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
      <Pressable style={styles.background} onPress={onClose} />

      <Animated.View style={[styles.sidebar, { right: slideAnim }]}>
        <Text style={styles.title}>Menu</Text>

        <TouchableOpacity onPress={onAccountPress} style={styles.item}>
          <Text style={styles.itemText}>Conta</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onEnterprisePress} style={styles.item}>
          <Text style={styles.itemText}>Empresa</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onLogout} style={[styles.item, styles.logout]}>
          <Text style={styles.itemText}>Sair</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    zIndex: 999,
  },
  background: {
    flex: 1,
    backgroundColor: '#00000066',
  },
  sidebar: {
    position: 'absolute',
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: '#fff',
    paddingVertical: 48,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 10,
    right: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 24,
    color: colors.primary,
  },
  item: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
  logout: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
});