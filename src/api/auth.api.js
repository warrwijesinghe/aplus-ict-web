import { authClient } from './clients/auth.client.js';
const unwrap = (response) => response.data.data;
export const authApi = {
  login: () => {
    window.location.assign(`${authClient.defaults.baseURL}/api/v1/auth/google`);
    return new Promise(() => {});
  },
  register: () => {
    window.location.assign(`${authClient.defaults.baseURL}/api/v1/auth/google`);
    return new Promise(() => {});
  },
  reviewerLogin: (input) =>
    authClient.post('/api/v1/auth/reviewer-login', input, { skipRefresh: true }).then(unwrap),
  refresh: () => authClient.post('/api/v1/auth/refresh', null, { skipRefresh: true }).then(unwrap),
  logout: () => authClient.post('/api/v1/auth/logout', null, { skipRefresh: true }).then(unwrap),
  logoutAll: () =>
    authClient.post('/api/v1/auth/logout-all', null, { skipRefresh: true }).then(unwrap),
  me: () => authClient.get('/api/v1/auth/me', { skipRefresh: true }).then(unwrap)
};
