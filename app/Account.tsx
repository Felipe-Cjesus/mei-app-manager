// app/Account.tsx
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useEnterprise } from '../contexts/EnterpriseContext';
import Button from '../src/components/Button';
import Header from '../src/components/HeaderSecundary';
import colors from '../src/theme/colors';

export default function Account() {
  const { user, logout } = useAuth();
  const { activeEnterprise, enterprises } = useEnterprise();
  const router = useRouter();

  const handleLogoutConfirm = () => {
    Alert.alert(
      'Encerrar Sessão',
      'Deseja realmente sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <View style={styles.container}>
      <Header title="Minha Conta 👤" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Card do Usuário */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Usuário MEI'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'email@exemplo.com'}</Text>
            <View style={styles.userBadge}>
              <Text style={styles.userBadgeText}>Plano MEI Pro</Text>
            </View>
          </View>
        </View>

        {/* Card de Empresa Ativa */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionCardHeader}>
            <Text style={styles.sectionCardTitle}>Empresa Ativa</Text>
            <TouchableOpacity onPress={() => router.push('/Enterprise')}>
              <Text style={styles.manageLinkText}>Gerenciar ({enterprises.length})</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.enterpriseBox}>
            <Feather name="briefcase" size={24} color={colors.primary} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.enterpriseName} numberOfLines={1}>
                {activeEnterprise?.company_name || 'Nenhuma empresa selecionada'}
              </Text>
              <Text style={styles.enterpriseCnpj}>
                {activeEnterprise?.company_id ? `CNPJ: ${activeEnterprise.company_id}` : 'Toque em Gerenciar para cadastrar'}
              </Text>
              {activeEnterprise?.city && (
                <Text style={styles.enterpriseLocation}>
                  {activeEnterprise.city} {activeEnterprise.state ? `- ${activeEnterprise.state}` : ''}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Atalhos Rápidos */}
        <View style={styles.sectionCard}>
          <Text style={[styles.sectionCardTitle, { marginBottom: 12 }]}>Atalhos do Sistema</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/Enterprise')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconWrapper, { backgroundColor: '#eef6ff' }]}>
                <Feather name="layers" size={18} color={colors.primary} />
              </View>
              <Text style={styles.menuItemText}>Gerenciar Clientes / Empresas</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#bbb" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/Notification')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconWrapper, { backgroundColor: '#fef5e7' }]}>
                <Feather name="bell" size={18} color="#f39c12" />
              </View>
              <Text style={styles.menuItemText}>Central de Notificações e Alertas</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#bbb" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={() => router.push('/(tabs)/Invoice')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconWrapper, { backgroundColor: '#e8f8f5' }]}>
                <Feather name="file-text" size={18} color="#1abc9c" />
              </View>
              <Text style={styles.menuItemText}>Módulo de Notas Fiscais</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#bbb" />
          </TouchableOpacity>
        </View>

        {/* Informações da Aplicação */}
        <View style={styles.appInfoContainer}>
          <Text style={styles.appVersion}>MEI Manager v1.0.0</Text>
          <Text style={styles.appDescription}>
            Sistema de Gestão Financeira e Fiscal para Microempreendedores e Contadores.
          </Text>
        </View>

        {/* Botão de Logout */}
        <Button
          title="Encerrar Sessão"
          onPress={handleLogoutConfirm}
          variant="secondary"
          style={styles.logoutButton}
        />

        <Button
          title="Voltar"
          onPress={() => router.back()}
          variant="outline"
          style={{ marginBottom: 30 }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  userEmail: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
    marginBottom: 6,
  },
  userBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f0fe',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  userBadgeText: {
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  manageLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  enterpriseBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eef0f2',
  },
  enterpriseName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  enterpriseCnpj: {
    fontSize: 12,
    color: '#666',
  },
  enterpriseLocation: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  appInfoContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  appVersion: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#888',
  },
  appDescription: {
    fontSize: 11,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    marginBottom: 12,
  },
});
