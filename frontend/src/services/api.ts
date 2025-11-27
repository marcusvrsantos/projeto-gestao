import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Usa o proxy do Vite
});

// Interceptor: Toda vez que chamar a API, anexa o Token se ele existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gestao_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
