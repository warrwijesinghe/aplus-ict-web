import { afterEach, describe, expect, it, vi } from 'vitest';
import { launchPayHereCheckout, validatePayHereCheckout } from '../src/features/store/payhere-checkout.js';

const checkout = { sandbox: true, merchant_id: '12345', notify_url: 'https://api.example.test/notify', order_id: 'PHORDER', items: 'Lesson access', amount: '2800.00', currency: 'LKR', hash: 'HASH', first_name: 'Ada', last_name: 'Lovelace', email: 'ada@example.test', phone: '94771234567', address: '1 Main Street', city: 'Colombo', country: 'Sri Lanka' };
afterEach(() => { document.body.replaceChildren(); vi.unstubAllGlobals(); });
describe('PayHere popup checkout', () => {
  it('requires an exactly two-decimal server amount', () => expect(() => validatePayHereCheckout({ ...checkout, amount: '2800' })).toThrow('exactly two decimal places'));
  it('starts the SDK popup and does not treat completion as payment success', async () => {
    const startPayment = vi.fn(); vi.stubGlobal('payhere', { startPayment });
    const completed = vi.fn(); await launchPayHereCheckout(checkout, { onCompleted: completed });
    expect(startPayment).toHaveBeenCalledWith(expect.objectContaining({ sandbox: true, return_url: undefined, cancel_url: undefined }));
    expect(completed).not.toHaveBeenCalled();
  });
  it('wires dismissal so the UI can restore Pay Now', async () => {
    const payhere = { startPayment: vi.fn() }; vi.stubGlobal('payhere', payhere);
    const dismissed = vi.fn(); await launchPayHereCheckout(checkout, { onDismissed: dismissed }); payhere.onDismissed();
    expect(dismissed).toHaveBeenCalledOnce();
  });
});
