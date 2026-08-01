import axios from 'axios';
import { authMemory } from '../../auth/auth-memory.js';
import { ApiError, normalizeApiError } from '../api-error.js';
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
    (response) => {
      // A missing gateway can return the SPA's HTML with HTTP 200. Treat that as an
      // API failure so public pages show a recoverable error, never a false success.
      const contentType = response.headers?.['content-type'] || '';
      if (response.config.responseType !== 'blob' && contentType.includes('text/html')) {
        const error = new ApiError({
          code: 'UNEXPECTED_HTML_RESPONSE',
          message: 'Learning content is temporarily unavailable. Please try again shortly.',
          service
        });
        if (import.meta.env.DEV) console.warn('Unexpected HTML response from API', { service, url: response.config.url });
        return Promise.reject(error);
      }
      return response;
    },
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
