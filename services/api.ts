// services/api.ts
import axios from 'axios';

// Em desenvolvimento local no celular/Expo Go, utilize o IP da máquina na mesma rede Wi-Fi ou túnel ngrok
export const DEVELOPMENT_BASE_URL = 'http://192.168.0.13:8000/api';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || DEVELOPMENT_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
});

export default api;
