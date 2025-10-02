// import { Ionicons } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import Header from '../../src/components/Header';
import Header from '../../src/components/HeaderSecundary';
import colors from '../../src/theme/colors';

export default function Finance() {
  const router = useRouter();
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

  return (
    <View style={styles.container}>
      {/* <Header /> */}
      {/* <View style={styles.containerHeader}>
        <Text style={styles.title}>Gerenciador Financeiro 💰</Text>
        <View style={styles.topRow}>
        </View>
      </View> */}

      <Header title={pageTitle} />

      <View style={styles.content}>
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
            onPress={() => router.push(includeRoute as any)}
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
  containerHeader: {
    backgroundColor: colors.primary,
    paddingTop: 60,
    paddingBottom: 50,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    alignSelf: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  section: {
    marginBottom: 32,
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