// components/Header.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import colors from '../theme/colors';

type HeaderProps = {
  title: string;
  onNotificationPress?: () => void;
  onSettingsPress?: () => void;
};

export default function Header({
  title,
  onNotificationPress,
  onSettingsPress,
}: HeaderProps) {

  return (
    <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        {/* <View style={styles.icons}>
          <TouchableOpacity onPress={onNotificationPress} style={styles.iconButton}>
            <Feather name="bell" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onSettingsPress} style={styles.iconButton}>
            <Feather name="user" size={22} color="#fff" />
          </TouchableOpacity>
        </View> */}
        <View style={styles.topRow}>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
   container: {
    backgroundColor: colors.primary,
    paddingTop: 60,
    paddingBottom: 50,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  text: {
    fontSize: 18,
    color: '#fff',
  },
  icons: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    marginLeft: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    alignSelf: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
});
