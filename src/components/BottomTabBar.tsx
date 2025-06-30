import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../theme/colors';

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const iconName = options.tabBarIcon
          ? typeof options.tabBarIcon === 'function'
            ? options.tabBarIcon({ focused: isFocused, color: isFocused ? 'white' : colors.primary, size: 24 })
            : options.tabBarIcon
          : null;

        // Animação de escala para o ícone
        const scale = isFocused ? new Animated.Value(1.8) : new Animated.Value(1);

        Animated.timing(scale, {
          toValue: isFocused ? 1.2 : 1,
          duration: 300,
          useNativeDriver: true,
        }).start();

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tab}
            activeOpacity={0.8}
          >
            <Animated.View
              style={[
                styles.iconWrapper,
                isFocused && { backgroundColor: colors.primary, padding: 8 },
                { transform: [{ scale }] },
              ]}
            >
              {iconName}
            </Animated.View>

            {typeof label === 'function' ? (
              label({
                focused: isFocused,
                color: isFocused ? colors.primary : '#ccc',
                position: 'below-icon',
                children: '',
              })
            ) : (
              <Text style={[styles.label, isFocused && { color: colors.primary }]}>{label}</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 100,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 10,
    paddingBottom: 10,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    borderRadius: 20, // Borda arredondada
    padding: 10, // Espaço ao redor do ícone
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5, // Espaço entre o ícone e o label
  },
  label: {
    fontSize: 12,
    color: '#ccc',
  },
});