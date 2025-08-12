// contexts/AuthContext.tsx
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

type User = {
  id: number;
  name: string;
  email: string;
};

type AuthContextData = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function login(email: string, password: string) {
    const response = await api.post('/login', { email, password });
    const { token, user } = response.data.data;

    console.log('🔍 response.data:', JSON.stringify(response.data, null, 2));
    
    if (!token || !user) {
        throw new Error('Token ou usuário não retornado pela API.');
    }

    // Armazenar token e user como string
    await SecureStore.setItemAsync('token', String(token));
    await SecureStore.setItemAsync('user', JSON.stringify(user));

    // Definir header global e estado
    api.defaults.headers.Authorization = `Bearer ${token}`;
    setUser(user);
  }

  async function logout() {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
    console.log('🔍 LOGOUT');
    setUser(null);
    router.replace('/login');
  }

  async function loadUser() {
    const token = await SecureStore.getItemAsync('token');
    const storedUser = await SecureStore.getItemAsync('user');

    //teste
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (token && storedUser) {
      api.defaults.headers.Authorization = `Bearer ${token}`;
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch {
        // fallback se JSON estiver corrompido
        setUser(null);
      }
    }

    setLoading(false);
  }

  useEffect(() => {
    loadUser();

    // Adiciona interceptor de resposta
    const interceptor = api.interceptors.response.use(
      response => response,
      async error => {
        if (error.response?.status === 401) {
          console.warn('⚠️ Sessão expirada, fazendo logout...');
          await logout();
        }
        return Promise.reject(error);
      }
    );

    // Remove interceptor ao desmontar
    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);