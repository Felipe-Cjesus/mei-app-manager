// services/api.ts
import axios from 'axios';

const PRODUCTION_BASE_URL = 'https://mei-api-production.up.railway.app/api'; 
const DEVELOPMENT_BASE_URL = 'https://779e65f877ab.ngrok-free.app/api';      // ngrok tunel

const api = axios.create({
  baseURL: DEVELOPMENT_BASE_URL, 
  headers: {
    Accept: 'application/json',
  },
});

export default api;
