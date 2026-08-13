import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearDirectPayCheckout, isDirectPayBrowserSuccess, launchDirectPayCheckout, validateDirectPayInitOptions } from '../src/features/store/directpay-checkout.js';

const checkout = { merchantId: 'LM13479', amount: '2500.00', reference: 'DPTEST', currency: 'LKR', customerEmail: 'student@example.com', customerMobile: '+94712345674', description: 'Lesson access' };

afterEach(() => {
  document.body.replaceChildren();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

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

  it('initializes inside the Card payment panel without appending a new body container', async () => {
    vi.stubEnv('VITE_DIRECTPAY_API_KEY', 'test-api-key');
    vi.stubEnv('VITE_DIRECTPAY_MERCHANT_ID', 'LM13479');
    const init = vi.fn();
    vi.stubGlobal('DirectPayCardPayment', { init });
    const cardPanel = document.createElement('section'); cardPanel.className = 'payment-option-content';
    const container = document.createElement('div'); container.id = 'directpay-card-container'; cardPanel.appendChild(container); document.body.appendChild(cardPanel);

    await launchDirectPayCheckout(checkout, { containerId: container.id });

    expect(cardPanel.contains(container)).toBe(true);
    expect(init).toHaveBeenCalledWith(expect.objectContaining({ container: 'directpay-card-container', logo: '' }));
    expect([...document.body.querySelectorAll('[id^="directpay-card-"]')].filter((element) => element.id !== 'directpay-card-container')).toHaveLength(0);
  });

  it('clears the previous DirectPay form before a retry', async () => {
    vi.stubEnv('VITE_DIRECTPAY_API_KEY', 'test-api-key');
    vi.stubEnv('VITE_DIRECTPAY_MERCHANT_ID', 'LM13479');
    const init = vi.fn(({ container }) => {
      const form = document.createElement('div'); form.id = 'dpMainContainer'; document.getElementById(container).appendChild(form);
    });
    vi.stubGlobal('DirectPayCardPayment', { init });
    const container = document.createElement('div'); container.id = 'directpay-card-container'; document.body.appendChild(container);

    await launchDirectPayCheckout(checkout, { containerId: container.id });
    await launchDirectPayCheckout(checkout, { containerId: container.id });

    expect(container.querySelectorAll('#dpMainContainer')).toHaveLength(1);
    clearDirectPayCheckout(container);
    expect(container.childElementCount).toBe(0);
  });
});
