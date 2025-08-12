// components/Header.tsx
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from '../../services/api';
import colors from '../theme/colors';

type HeaderProps = {
  onNotificationPress?: () => void;
  onSettingsPress?: () => void;
};

export default function Header({
  onNotificationPress,
  onSettingsPress,
}: HeaderProps) {
  const [company_name, setCompanyName] = useState('MEI Manager');
  const [company_id, setCompanyId] = useState('CNPJ 000000000');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [number, setNumber] = useState('');
  const [contact, setContact] = useState('');
  const [social_media, setSocial_media] = useState('');

  useEffect(() => {
    async function fetchCompany() {
      try {
        const response = await api.get('/enterprises');
        const { company_name, company_id, state, city, address, number, contact, social_media } = response.data.data;
        // console.log('🔍 response.data: ', JSON.stringify(response.data, null, 2));
        setCompanyName(company_name);
        setCompanyId(`CNPJ: ${company_id}`);
        setState(state);
        setCity(city);
        setAddress(address);
        setNumber(number);
        setContact(contact);
        setSocial_media(social_media);
      } catch (error) {
        console.error('Erro ao buscar empresa:', error);
      }
    }

    fetchCompany();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.title}>{company_name}</Text>
        <View style={styles.icons}>
          <TouchableOpacity onPress={onNotificationPress} style={styles.iconButton}>
            <Feather name="bell" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onSettingsPress} style={styles.iconButton}>
            <Feather name="user" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.text}>{company_id}</Text>
      <Text style={styles.subtext}>{state} - {city}</Text>
      <Text style={styles.subtext}>{address}, {number}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    paddingTop: 60,
    paddingBottom: 100,
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  text: {
    fontSize: 18,
    color: '#fff',
  },
  subtext: {
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
});
