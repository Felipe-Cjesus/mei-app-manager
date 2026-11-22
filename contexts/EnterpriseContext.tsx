// contexts/EnterpriseContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

export type EnterpriseItem = {
  id: number;
  user_id?: number;
  company_name: string;
  company_id: string;
  state?: string | null;
  city?: string | null;
  address?: string | null;
  number?: string | null;
  contact?: string | null;
  social_media?: string | null;
};

type EnterpriseContextData = {
  enterprises: EnterpriseItem[];
  activeEnterprise: EnterpriseItem | null;
  loadingEnterprises: boolean;
  selectEnterprise: (enterprise: EnterpriseItem) => Promise<void>;
  fetchEnterprises: () => Promise<void>;
};

const STORAGE_KEY = '@active_enterprise_id';

const EnterpriseContext = createContext<EnterpriseContextData>(
  {} as EnterpriseContextData
);

export const EnterpriseProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [enterprises, setEnterprises] = useState<EnterpriseItem[]>([]);
  const [activeEnterprise, setActiveEnterprise] = useState<EnterpriseItem | null>(null);
  const [loadingEnterprises, setLoadingEnterprises] = useState(false);

  const fetchEnterprises = async () => {
    if (!user) {
      setEnterprises([]);
      setActiveEnterprise(null);
      return;
    }

    try {
      setLoadingEnterprises(true);
      const response = await api.get('/enterprises');
      let list: EnterpriseItem[] = [];

      if (Array.isArray(response.data?.data)) {
        list = response.data.data;
      } else if (response.data?.data && typeof response.data.data === 'object' && response.data.data.id) {
        list = [response.data.data];
      }

      setEnterprises(list);

      if (list.length > 0) {
        // Tenta recuperar a última empresa ativa salva no dispositivo
        const savedId = await AsyncStorage.getItem(STORAGE_KEY);
        let found = list.find((e) => String(e.id) === savedId);

        // Se não encontrar o ID salvo, adota a primeira como padrão
        if (!found) {
          found = list[0];
          await AsyncStorage.setItem(STORAGE_KEY, String(found.id));
        }

        setActiveEnterprise(found);
      } else {
        setActiveEnterprise(null);
      }
    } catch (error: any) {
      // 404 é esperado quando o usuário ainda não possui nenhuma empresa cadastrada
      if (error?.response?.status !== 404) {
        console.error('Erro ao carregar lista de empresas:', error);
      }
      setEnterprises([]);
      setActiveEnterprise(null);
    } finally {
      setLoadingEnterprises(false);
    }
  };

  const selectEnterprise = async (enterprise: EnterpriseItem) => {
    try {
      setActiveEnterprise(enterprise);
      await AsyncStorage.setItem(STORAGE_KEY, String(enterprise.id));
    } catch (error) {
      console.error('Erro ao salvar empresa ativa:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEnterprises();
    } else {
      setEnterprises([]);
      setActiveEnterprise(null);
    }
  }, [user]);

  return (
    <EnterpriseContext.Provider
      value={{
        enterprises,
        activeEnterprise,
        loadingEnterprises,
        selectEnterprise,
        fetchEnterprises,
      }}
    >
      {children}
    </EnterpriseContext.Provider>
  );
};

export const useEnterprise = () => useContext(EnterpriseContext);

