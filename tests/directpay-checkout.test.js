import { describe, expect, it } from 'vitest';
import { isDirectPayBrowserSuccess, validateDirectPayInitOptions } from '../src/features/store/directpay-checkout.js';

describe('DirectPay browser callback handling', () => {
  it('treats browser SUCCESS only as a transition to server confirmation', () => {
    expect(isDirectPayBrowserSuccess({ data: { status: 'SUCCESS' } })).toBe(true);
  });

  it('does not accept failed or malformed browser callbacks', () => {
    expect(isDirectPayBrowserSuccess({ data: { status: 'FAILED' } })).toBe(false);
    expect(isDirectPayBrowserSuccess({})).toBe(false);
  });

  it('reports the exact missing mandatory SDK field before initialization', () => {
    const container = document.createElement('div'); container.id = 'directpay-test'; document.body.appendChild(container);
    const options = { container: container.id, merchantId: 'LM13479', amount: '2500.00', refCode: 'DPTEST', currency: 'LKR', type: 'ONE_TIME_PAYMENT', customerEmail: 'student@example.com', customerMobile: '+94712345674', description: 'Lesson access', debug: true, responseCallback: () => undefined, errorCallback: () => undefined, apiKey: '' };
    expect(() => validateDirectPayInitOptions(options)).toThrow("'apiKey' is required");
    container.remove();
  });
});
