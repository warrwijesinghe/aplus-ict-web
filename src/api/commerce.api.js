import { commerceClient } from './clients/commerce.client.js';
const unwrap = (response) => response.data;
const headers = () => ({ 'Idempotency-Key': crypto.randomUUID() });
export const commerceApi = {
  products: (params, signal) =>
    commerceClient.get('/api/v1/store/products', { params, signal }).then(unwrap),
  product: (slug, signal) =>
    commerceClient.get(`/api/v1/store/products/${slug}`, { signal }).then(unwrap),
  orders: (params, signal) =>
    commerceClient.get('/api/v1/commerce/me/orders', { params, signal }).then(unwrap),
  order: (id, signal) =>
    commerceClient.get(`/api/v1/commerce/me/orders/${id}`, { signal }).then(unwrap),
  createOrder: (body) =>
    commerceClient.post('/api/v1/commerce/me/orders', body, { headers: headers() }).then(unwrap),
  payments: (id) => commerceClient.get(`/api/v1/commerce/me/orders/${id}/payments`).then(unwrap),
  submitBankTransfer: (id, body) =>
    commerceClient
      .post(`/api/v1/commerce/me/orders/${id}/payments/bank-transfer`, body, { headers: headers() })
      .then(unwrap)
};
