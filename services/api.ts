// services/api.ts
import axios from 'axios';

export const PRODUCTION_BASE_URL = 'https://mei-api-production.up.railway.app/api'; 
export const DEVELOPMENT_BASE_URL = 'https://8e8948e40bfd.ngrok-free.app/api';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || DEVELOPMENT_BASE_URL, 
  headers: {
    Accept: 'application/json',
  },
});

export default api;
