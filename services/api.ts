// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://mei-api-production.up.railway.app/api',
  headers: {
    Accept: 'application/json',
  },
});

export default api;
