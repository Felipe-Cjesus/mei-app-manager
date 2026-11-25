// app/Sidebar.tsx
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useEnterprise } from '../contexts/EnterpriseContext';
import colors from '../src/theme/colors';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.min(width * 0.84, 340);

type SidebarProps = {
  visible: boolean;
  onClose: () => void;
  onAccountPress: () => void;
  onEnterprisePress: () => void;
  onLogout: () => void;
  onNotificationPress?: () => void;
};

export default function Sidebar({
  visible,
  onClose,
  onAccountPress,
  onEnterprisePress,
  onLogout,
  onNotificationPress,
}: SidebarProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { activeEnterprise, enterprises } = useEnterprise();

  const slideAnim = useRef(new Animated.Value(SIDEBAR_WIDTH)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          friction: 9,
          tension: 65,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SIDEBAR_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, opacityAnim, slideAnim]);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleLogoutPress = () => {
    Alert.alert(
      'Encerrar Sessão',
      'Deseja realmente sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: onLogout,
        },
      ]
    );
  };

  const handleNotificationClick = () => {
    onClose();
    if (onNotificationPress) {
      onNotificationPress();
    } else {
      router.push('/Notification');
    }
  };

  return (
    <Animated.View
      style={[styles.overlay, { opacity: opacityAnim }]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <Pressable style={styles.background} onPress={onClose} />

      <Animated.View
        style={[
          styles.sidebar,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        {/* Cabeçalho do Menu com Botão de Fechar */}
        <View style={styles.topHeader}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>MEI MANAGER</Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <Feather name="x" size={20} color="#475569" />
          </TouchableOpacity>
        </View>

        {/* Card de Perfil do Usuário */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.name || 'Microempreendedor'}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user?.email || 'conta@meiapp.com'}
            </Text>

            {/* Empresa Ativa */}
            <View style={styles.enterprisePill}>
              <Feather name="briefcase" size={11} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={styles.enterprisePillText} numberOfLines={1}>
                {activeEnterprise?.company_name || 'Nenhuma empresa'}
              </Text>
            </View>
          </View>
        </View>

        {/* Lista de Navegação */}
        <ScrollView
          style={styles.menuScroll}
          contentContainerStyle={styles.menuContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionHeader}>NAVEGAÇÃO</Text>

          {/* Item: Minha Conta */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={onAccountPress}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#eff6ff' }]}>
              <Feather name="user" size={18} color="#2563eb" />
            </View>
            <View style={styles.itemTextContainer}>
              <Text style={styles.itemTitle}>Minha Conta</Text>
              <Text style={styles.itemSubtitle}>Dados de perfil e segurança</Text>
            </View>
            <Feather name="chevron-right" size={16} color="#cbd5e1" />
          </TouchableOpacity>

          {/* Item: Gestão de Empresas */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={onEnterprisePress}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#f0fdf4' }]}>
              <Feather name="briefcase" size={18} color="#16a34a" />
            </View>
            <View style={styles.itemTextContainer}>
              <Text style={styles.itemTitle}>Gestão de Empresas</Text>
              <Text style={styles.itemSubtitle}>
                {enterprises.length === 1
                  ? '1 empresa vinculada'
                  : `${enterprises.length} empresas vinculadas`}
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color="#cbd5e1" />
          </TouchableOpacity>

          {/* Item: Notificações & Alertas */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleNotificationClick}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#fff7ed' }]}>
              <Feather name="bell" size={18} color="#ea580c" />
            </View>
            <View style={styles.itemTextContainer}>
              <Text style={styles.itemTitle}>Notificações</Text>
              <Text style={styles.itemSubtitle}>Avisos de DAS e limites</Text>
            </View>
            <Feather name="chevron-right" size={16} color="#cbd5e1" />
          </TouchableOpacity>

          <Text style={[styles.sectionHeader, { marginTop: 24 }]}>INFORMAÇÕES FISCAIS</Text>

          {/* Item: Teto Fiscal */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              Alert.alert(
                'Teto Fiscal MEI 2026',
                'O limite de faturamento anual do MEI é de R$ 81.000,00 (média de R$ 6.750,00/mês). Acompanhe o termômetro na tela inicial para manter seu negócio seguro!'
              );
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#f5f3ff' }]}>
              <Feather name="shield" size={18} color="#7c3aed" />
            </View>
            <View style={styles.itemTextContainer}>
              <Text style={styles.itemTitle}>Teto MEI 2026</Text>
              <Text style={styles.itemSubtitle}>Limite anual de R$ 81.000,00</Text>
            </View>
            <Feather name="info" size={16} color="#cbd5e1" />
          </TouchableOpacity>
        </ScrollView>

        {/* Rodapé: Botão Sair e Versão */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogoutPress}
            activeOpacity={0.7}
          >
            <View style={styles.logoutIconWrapper}>
              <Feather name="log-out" size={17} color="#dc2626" />
            </View>
            <View style={styles.itemTextContainer}>
              <Text style={styles.logoutText}>Encerrar Sessão</Text>
              <Text style={styles.logoutSubtext}>Desconectar do aplicativo</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>MEI Manager • Versão 2.0.0</Text>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 9999,
  },
  background: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderBottomLeftRadius: 28,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    paddingHorizontal: 20,
    shadowColor: '#0f172a',
    shadowOffset: { width: -8, height: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 25,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  brandBadge: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  brandBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.8,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  userEmail: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
    marginBottom: 4,
  },
  enterprisePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eafaf1',
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    maxWidth: '100%',
  },
  enterprisePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primaryDark,
    flexShrink: 1,
  },
  menuScroll: {
    flex: 1,
  },
  menuContent: {
    paddingVertical: 4,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 4,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
  },
  logoutIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#dc2626',
  },
  logoutSubtext: {
    fontSize: 11,
    color: '#ef4444',
    marginTop: 1,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 14,
  },
  versionText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
});