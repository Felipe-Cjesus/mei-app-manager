// app/(tabs)/_layout.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import BottomTabBar from '../../src/components/BottomTabBar';

export default function AppTabs() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }: { color: any; size: number }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Início',
        }}
      />
      <Tabs.Screen
        name="Finance"
        options={{
          tabBarIcon: ({ color, size }: { color: any; size: number }) => (
            <Ionicons name="wallet-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Financeiro',
        }}
      />
      <Tabs.Screen
        name="Invoice"
        options={{
          tabBarIcon: ({ color, size }: { color: any; size: number }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Notas fiscais',
        }}
      />
      <Tabs.Screen
        name="Chart"
        options={{
          tabBarIcon: ({ color, size }: { color: any; size: number }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Gráficos',
        }}
      />
    </Tabs>
  );
}
