import { authClient } from './clients/auth.client.js';
const unwrap = (response) => response.data.data;
export const authApi = {
  login: (input) =>
    authClient.post('/api/v1/auth/login', input, { skipRefresh: true }).then(unwrap),
  register: (input) =>
    authClient.post('/api/v1/auth/register', input, { skipRefresh: true }).then(unwrap),
  refresh: () => authClient.post('/api/v1/auth/refresh', null, { skipRefresh: true }).then(unwrap),
  logout: () => authClient.post('/api/v1/auth/logout', null, { skipRefresh: true }).then(unwrap),
  logoutAll: () =>
    authClient.post('/api/v1/auth/logout-all', null, { skipRefresh: true }).then(unwrap),
  me: () => authClient.get('/api/v1/auth/me', { skipRefresh: true }).then(unwrap)
};
