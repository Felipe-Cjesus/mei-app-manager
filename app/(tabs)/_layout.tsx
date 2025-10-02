// import { Ionicons } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BottomTabBar from '../../src/components/BottomTabBar';
import Chart from './Chart';
import Finance from './Finance';
import Home from './index';
import Invoice from './Invoice';

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <Tab.Navigator 
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomTabBar {...props} />}>
      <Tab.Screen
        name="Index"
        component={Home}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Início',
        }}
      />
      <Tab.Screen
        name="Finance"
        component={Finance}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="wallet-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Financeiro',
        }}
      />
      <Tab.Screen
        name="Invoice"
        component={Invoice}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Notas fiscais',
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={Chart}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Gráficos',
        }}
      />
    </Tab.Navigator>
  );
}