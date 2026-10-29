import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL
  ? import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, '')
  : '';

const api = axios.create({
  baseURL: backendUrl ? `${backendUrl}/api` : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('erp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to catch unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      localStorage.removeItem('erp_token');
      localStorage.removeItem('erp_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
