import { commerceClient } from './clients/commerce.client.js';
const unwrap = (response) => response.data;
const itemList = (response) => ({ data: { items: response.data.data } });
const headers = () => ({ 'Idempotency-Key': crypto.randomUUID() });
export const commerceApi = {
  products: (params, signal) =>
    commerceClient.get('/api/v1/store/products', { params, signal }).then(itemList),
  product: (slug, signal) =>
    commerceClient.get(`/api/v1/store/products/${slug}`, { signal }).then(unwrap),
  orders: (params, signal) =>
    commerceClient.get('/api/v1/orders', { params, signal }).then(itemList),
  order: (id, signal) =>
    commerceClient.get(`/api/v1/orders/${id}`, { signal }).then((response) => ({
      data: { ...response.data.data, totalAmount: response.data.data.total }
    })),
  createOrder: (body) =>
    commerceClient
      .post(
        '/api/v1/orders',
        { productIds: body.productIds ?? body.items?.map((item) => item.productId) },
        { headers: headers() }
      )
      .then(unwrap),
  payments: (id) => commerceClient.get(`/api/v1/orders/${id}/payments`).then(unwrap),
  submitBankTransfer: (id, body) =>
    commerceClient
      .post(`/api/v1/orders/${id}/payments/bank-transfer`, body, { headers: headers() })
      .then(unwrap)
};
