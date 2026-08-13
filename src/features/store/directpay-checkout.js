const developmentSdk = 'https://cdn.directpay.lk/dev/v1/directpayCardPayment.js?v=1';
const productionSdk = 'https://cdn.directpay.lk/v1/directpayCardPayment.js?v=1';

export const isDirectPayBrowserSuccess = (response) => response?.data?.status === 'SUCCESS';

const loadSdk = (environment) => new Promise((resolve, reject) => {
  if (window.DirectPayCardPayment) return resolve(window.DirectPayCardPayment);
  const id = 'directpay-card-payment-sdk';
  const existing = document.getElementById(id);
  if (existing) { existing.addEventListener('load', () => resolve(window.DirectPayCardPayment), { once: true }); existing.addEventListener('error', () => reject(new Error('DirectPay checkout could not be loaded')), { once: true }); return; }
  const script = document.createElement('script'); script.id = id; script.src = environment === 'production' ? productionSdk : developmentSdk; script.async = true;
  script.onload = () => window.DirectPayCardPayment ? resolve(window.DirectPayCardPayment) : reject(new Error('DirectPay checkout is unavailable'));
  script.onerror = () => reject(new Error('DirectPay checkout could not be loaded'));
  document.head.appendChild(script);
});

export const launchDirectPayCheckout = async (checkout, { onSuccess, onError } = {}) => {
  const apiKey = import.meta.env.VITE_DIRECTPAY_API_KEY;
  const configuredMerchantId = import.meta.env.VITE_DIRECTPAY_MERCHANT_ID;
  if (!apiKey || !configuredMerchantId) throw new Error('DirectPay checkout is not configured');
  if (configuredMerchantId !== checkout.merchantId) throw new Error('DirectPay merchant configuration does not match this order');
  const container = document.createElement('div'); container.id = `directpay-card-${checkout.reference}`; document.body.appendChild(container);
  try {
    const sdk = await loadSdk(import.meta.env.VITE_DIRECTPAY_ENV || 'development');
    sdk.init({ container: container.id, merchantId: checkout.merchantId, amount: checkout.amount, refCode: checkout.reference, currency: checkout.currency, type: 'ONE_TIME_PAYMENT', customerEmail: checkout.customerEmail, customerMobile: checkout.customerMobile, description: checkout.description, debug: import.meta.env.DEV, apiKey, responseCallback: onSuccess, errorCallback: onError });
  } catch (error) { container.remove(); throw error; }
};
