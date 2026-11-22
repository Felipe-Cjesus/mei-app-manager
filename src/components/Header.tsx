// src/components/Header.tsx
import Feather from '@expo/vector-icons/Feather';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useEnterprise } from '../../contexts/EnterpriseContext';
import colors from '../theme/colors';
import EnterprisePickerModal from './EnterprisePickerModal';

type HeaderProps = {
  onNotificationPress?: () => void;
  onSettingsPress?: () => void;
};

export default function Header({
  onNotificationPress,
  onSettingsPress,
}: HeaderProps) {
  const { activeEnterprise, enterprises } = useEnterprise();
  const [pickerVisible, setPickerVisible] = useState(false);

  const companyName = activeEnterprise?.company_name || 'Selecione uma Empresa';
  const companyCnpj = activeEnterprise?.company_id
    ? `CNPJ: ${activeEnterprise.company_id}`
    : 'Toque para selecionar';
  const state = activeEnterprise?.state || '';
  const city = activeEnterprise?.city || '';
  const address = activeEnterprise?.address || '';
  const number = activeEnterprise?.number || '';

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.selectorButton}
          onPress={() => setPickerVisible(true)}
          activeOpacity={0.8}
        >
          <View style={styles.selectorTextContainer}>
            <View style={styles.companyTitleRow}>
              <Text style={styles.title} numberOfLines={1}>
                {companyName}
              </Text>
              <Feather name="chevron-down" size={20} color="#fff" style={{ marginLeft: 6 }} />
            </View>
            <Text style={styles.text}>{companyCnpj}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.icons}>
          <TouchableOpacity onPress={onNotificationPress} style={styles.iconButton}>
            <Feather name="bell" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onSettingsPress} style={styles.iconButton}>
            <Feather name="user" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {(city || state) && (
        <Text style={styles.subtext}>
          {city}
          {state ? ` - ${state}` : ''}
        </Text>
      )}
      {address && (
        <Text style={styles.subtext}>
          {address}
          {number ? `, ${number}` : ''}
        </Text>
      )}

      {enterprises.length > 1 && (
        <TouchableOpacity
          style={styles.switchBadge}
          onPress={() => setPickerVisible(true)}
        >
          <Feather name="repeat" size={12} color="#fff" style={{ marginRight: 4 }} />
          <Text style={styles.switchBadgeText}>Trocar Cliente / Empresa</Text>
        </TouchableOpacity>
      )}

      <EnterprisePickerModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    paddingTop: 56,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  selectorButton: {
    flex: 1,
    marginRight: 12,
  },
  selectorTextContainer: {
    justifyContent: 'center',
  },
  companyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    maxWidth: '85%',
  },
  text: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  subtext: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  icons: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  iconButton: {
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
  },
  switchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  switchBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
});
