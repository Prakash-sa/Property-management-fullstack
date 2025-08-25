import axios from 'axios';
import type { Store } from '@reduxjs/toolkit';
import { logout } from '../features/auth/authSlice';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

let interceptorsAttached = false;
export function attachInterceptors(store: Store) {
  if (interceptorsAttached) return;

  api.interceptors.request.use((config) => {
    const token = (store.getState() as any).auth.token || localStorage.getItem('jwt_token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  });

  api.interceptors.response.use(
    (res) => res,
    (error) => {
      if (error?.response?.status === 401) {
        store.dispatch(logout());
        window.location.replace('/login');
      }
      return Promise.reject(error);
    }
  );
  interceptorsAttached = true;
}

export async function getWithRetry(url: string, { params }: { params?: Record<string, any> } = {}, retries = 3, delayMs = 600) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try { return await api.get(url, { params }); }
    catch (err: any) {
      const status = err?.response?.status;
      const retriable = !err.response || [502, 503, 504].includes(status);
      if (attempt == retries || !retriable) throw err;
      await new Promise(r => setTimeout(r, delayMs * Math.pow(2, attempt)));
    }
  }
}
