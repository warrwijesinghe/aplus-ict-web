const developmentSdk = 'https://cdn.directpay.lk/dev/v1/directpayCardPayment.js?v=1';
const productionSdk = 'https://cdn.directpay.lk/v1/directpayCardPayment.js?v=1';

export const isDirectPayBrowserSuccess = (response) => response?.data?.status === 'SUCCESS';

const fieldError = (field, reason) => new Error(`DirectPay checkout parameter '${field}' ${reason}`);
const requiredText = (value, field) => {
  if (typeof value !== 'string' || !value.trim()) throw fieldError(field, 'is required');
  return value.trim();
};

export const validateDirectPayInitOptions = (options) => {
  const container = requiredText(options.container, 'container');
  if (!document.getElementById(container)) throw fieldError('container', 'does not identify an existing DOM element');
  const merchantId = requiredText(options.merchantId, 'merchantId');
  if (/\s/.test(merchantId)) throw fieldError('merchantId', 'must not contain whitespace');
  const amount = requiredText(options.amount, 'amount');
  if (!/^(0|[1-9]\d*)(?:\.\d{1,2})?$/.test(amount)) throw fieldError('amount', 'must be a decimal amount with at most two decimal places');
  const refCode = requiredText(options.refCode, 'refCode');
  if (refCode.length > 20) throw fieldError('refCode', 'must not exceed 20 characters');
  const currency = requiredText(options.currency, 'currency');
  if (!['LKR', 'USD'].includes(currency)) throw fieldError('currency', 'must be LKR or USD');
  if (options.type !== 'ONE_TIME_PAYMENT') throw fieldError('type', 'must be ONE_TIME_PAYMENT');
  const customerEmail = requiredText(options.customerEmail, 'customerEmail');
  if (customerEmail.length > 100 || !/^\S+@\S+\.\S+$/.test(customerEmail)) throw fieldError('customerEmail', 'must be a valid email address of at most 100 characters');
  const customerMobile = requiredText(options.customerMobile, 'customerMobile');
  if (!/^\+?\d{10,15}$/.test(customerMobile)) throw fieldError('customerMobile', 'must contain 10 to 15 digits, optionally prefixed with +');
  const description = requiredText(options.description, 'description');
  if (description.length > 100) throw fieldError('description', 'must not exceed 100 characters');
  if (typeof options.debug !== 'boolean') throw fieldError('debug', 'must be a boolean');
  if (typeof options.responseCallback !== 'function') throw fieldError('responseCallback', 'must be a function');
  if (typeof options.errorCallback !== 'function') throw fieldError('errorCallback', 'must be a function');
  requiredText(options.apiKey, 'apiKey');
  return options;
};

const logDirectPayInitDiagnostics = (options) => {
  if (!import.meta.env.DEV) return;
  console.info('[DirectPay DEV] init parameters', {
    container: options.container,
    containerExists: Boolean(document.getElementById(options.container)),
    merchantId: options.merchantId,
    amount: options.amount,
    refCode: options.refCode,
    currency: options.currency,
    type: options.type,
    customerEmail: options.customerEmail,
    customerMobile: options.customerMobile,
    description: options.description,
    debug: options.debug,
    responseCallbackType: typeof options.responseCallback,
    errorCallbackType: typeof options.errorCallback,
    apiKeyPresent: Boolean(options.apiKey),
    lengths: {
      merchantId: options.merchantId?.length ?? 0,
      refCode: options.refCode?.length ?? 0,
      email: options.customerEmail?.length ?? 0,
      mobile: options.customerMobile?.length ?? 0,
      description: options.description?.length ?? 0,
    },
  });
};

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

export const launchDirectPayCheckout = async (checkout, { onSuccess = () => undefined, onError = () => undefined } = {}) => {
  const apiKey = import.meta.env.VITE_DIRECTPAY_API_KEY;
  const configuredMerchantId = import.meta.env.VITE_DIRECTPAY_MERCHANT_ID;
  if (!apiKey || !configuredMerchantId) throw new Error('DirectPay checkout is not configured');
  if (configuredMerchantId !== checkout.merchantId) throw new Error('DirectPay merchant configuration does not match this order');
  const container = document.createElement('div'); container.id = `directpay-card-${checkout.reference}`; document.body.appendChild(container);
  const options = {
    container: container.id, merchantId: checkout.merchantId, amount: checkout.amount, refCode: checkout.reference, currency: checkout.currency,
    type: 'ONE_TIME_PAYMENT', customerEmail: checkout.customerEmail, customerMobile: checkout.customerMobile, description: checkout.description,
    debug: import.meta.env.DEV, apiKey, responseCallback: onSuccess, errorCallback: onError,
  };
  try {
    const sdk = await loadSdk(import.meta.env.VITE_DIRECTPAY_ENV || 'development');
    validateDirectPayInitOptions(options);
    logDirectPayInitDiagnostics(options);
    sdk.init(options);
  } catch (error) { container.remove(); throw error; }
};
