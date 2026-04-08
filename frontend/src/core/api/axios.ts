import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8080',
});

// Interceptor sempre lê do localStorage — já estava assim, confirma que está
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sensara_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});