import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useEnterprise } from '../../contexts/EnterpriseContext';
import Header from '../../src/components/HeaderSecundary';
import colors from '../../src/theme/colors';

export default function Finance() {
  const router = useRouter();
  const { activeEnterprise } = useEnterprise();
  const pageTitle = 'Gerenciador Financeiro 💰';

  const sections = [
    {
      title: 'Receitas',
      includeRoute: '/income/create',
      listRoute: '/income/list',
    },
    {
      title: 'Despesas',
      includeRoute: '/expense/create',
      listRoute: '/expense/list',
    },
    {
      title: 'Guia DAS',
      includeRoute: '/das/create',
      listRoute: '/das/list',
    },
  ] as const;

  const handlePressInclude = (route: string) => {
    if (!activeEnterprise?.id) {
      Toast.show({
        type: 'error',
        text1: 'Empresa Obrigatória',
        text2: 'Cadastre ou selecione uma empresa antes de fazer novos lançamentos.',
      });
      router.push('/Enterprise');
      return;
    }
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <Header title={pageTitle} />

      <View style={styles.content}>
        {/* Banner de alerta caso não haja empresa ativa */}
        {!activeEnterprise ? (
          <View style={styles.warningBanner}>
            <Feather name="alert-triangle" size={20} color="#d97706" style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.warningTitle}>Nenhuma Empresa Selecionada</Text>
              <Text style={styles.warningText}>
                Cadastre ou selecione uma empresa para registrar receitas, despesas e guias DAS.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.bannerButton}
              onPress={() => router.push('/Enterprise')}
            >
              <Text style={styles.bannerButtonText}>Cadastrar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.enterpriseBadge}>
            <Feather name="briefcase" size={14} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.enterpriseBadgeText} numberOfLines={1}>
              Empresa ativa: <Text style={{ fontWeight: '700' }}>{activeEnterprise.company_name}</Text>
            </Text>
          </View>
        )}

        {sections.map((section) => (
          <Section
            key={section.title}
            title={section.title}
            includeRoute={section.includeRoute}
            listRoute={section.listRoute}
          />
        ))}
      </View>
    </View>
  );

  function Section({
    title,
    includeRoute,
    listRoute,
  }: {
    title: string;
    includeRoute: '/income/create' | '/income/list' | '/expense/create' | '/expense/list' | '/das/create' | '/das/list';
    listRoute: '/income/create' | '/income/list' | '/expense/create' | '/expense/list' | '/das/create' | '/das/list';
  }) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.cardContainer}>
          <OptionCard
            icon="add-circle-outline"
            label="Incluir"
            onPress={() => handlePressInclude(includeRoute)}
          />
          <OptionCard
            icon="list-outline"
            label="Listar"
            onPress={() => router.push(listRoute as any)}
          />
        </View>
      </View>
    );
  }
}

function OptionCard({
  icon,
  label,
  onPress,
}: {
  icon: any;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Ionicons name={icon} size={28} color={colors.primary} />
      <Text style={styles.cardLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400e',
  },
  warningText: {
    fontSize: 12,
    color: '#b45309',
    marginTop: 2,
  },
  bannerButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  bannerButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  enterpriseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  enterpriseBadgeText: {
    fontSize: 13,
    color: colors.primaryDark,
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 12,
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
  },
});