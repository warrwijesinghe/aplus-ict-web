import axios from 'axios';
import { authMemory } from '../../auth/auth-memory.js';
import { normalizeApiError } from '../api-error.js';
import { refreshOnce } from '../refresh-queue.js';

export const createClient = (baseURL, service, { authCookie = false } = {}) => {
  const client = axios.create({
    baseURL,
    timeout: Number(import.meta.env.VITE_API_TIMEOUT_MS || 10000),
    withCredentials: authCookie,
    headers: { Accept: 'application/json' }
  });
  client.interceptors.request.use((config) => {
    const token = authMemory.get();
    if (token && !config.skipAuth) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const config = error.config || {};
      const eligible =
        error.response?.status === 401 &&
        !config._retried &&
        !config.skipRefresh &&
        service !== 'auth';
      if (eligible && authMemory.get()) {
        config._retried = true;
        try {
          await refreshOnce();
          return client(config);
        } catch {
          // The normalized error below is deliberately returned after session state is cleared.
        }
      }
      return Promise.reject(normalizeApiError(error, service));
    }
  );
  return client;
};
