import axios from 'axios';

const BASE_URL = 'https://frontend-task-chatapp.onrender.com/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor — attach Bearer token ────────────────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('chat_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ─── Response Interceptor — handle 401 globally ──────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Clear stale auth and redirect to login
      localStorage.removeItem('chat_token');
      localStorage.removeItem('chat_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
