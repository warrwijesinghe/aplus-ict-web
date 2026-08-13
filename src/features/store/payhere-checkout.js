const sdkUrl = 'https://www.payhere.lk/lib/payhere.js';

const required = ['merchant_id', 'notify_url', 'order_id', 'items', 'amount', 'currency', 'hash', 'first_name', 'last_name', 'email', 'phone', 'address', 'city', 'country'];
export const validatePayHereCheckout = (checkout) => {
  for (const field of required) if (typeof checkout?.[field] !== 'string' || !checkout[field].trim()) throw new Error(`PayHere checkout parameter '${field}' is required`);
  if (!/^(0|[1-9]\d*)\.\d{2}$/.test(checkout.amount)) throw new Error("PayHere checkout amount must have exactly two decimal places");
  if (checkout.currency !== 'LKR') throw new Error('PayHere checkout currency must be LKR');
  return checkout;
};
export const loadPayHereSdk = () => new Promise((resolve, reject) => {
  if (window.payhere) return resolve(window.payhere);
  const id = 'payhere-sdk'; const existing = document.getElementById(id);
  if (existing) { existing.addEventListener('load', () => window.payhere ? resolve(window.payhere) : reject(new Error('PayHere checkout is unavailable')), { once: true }); existing.addEventListener('error', () => reject(new Error('PayHere checkout could not be loaded')), { once: true }); return; }
  const script = document.createElement('script'); script.id = id; script.src = sdkUrl; script.async = true;
  script.onload = () => window.payhere ? resolve(window.payhere) : reject(new Error('PayHere checkout is unavailable'));
  script.onerror = () => reject(new Error('PayHere checkout could not be loaded'));
  document.head.appendChild(script);
});
export const launchPayHereCheckout = async (checkout, { onCompleted = () => undefined, onDismissed = () => undefined, onError = () => undefined } = {}) => {
  validatePayHereCheckout(checkout);
  const payhere = await loadPayHereSdk();
  payhere.onCompleted = onCompleted;
  payhere.onDismissed = onDismissed;
  payhere.onError = onError;
  payhere.startPayment({ ...checkout, sandbox: Boolean(checkout.sandbox), return_url: undefined, cancel_url: undefined });
};
