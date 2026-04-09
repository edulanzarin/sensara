import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8080',
});

api.interceptors.request.use((config) => {
  const isPublicRoute =
    (config.url === '/auth/login' && config.method === 'post') ||
    (config.url === '/users' && config.method === 'post');

  if (!isPublicRoute) {
    const token = localStorage.getItem('sensara_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});