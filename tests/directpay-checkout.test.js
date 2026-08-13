import { describe, expect, it } from 'vitest';
import { isDirectPayBrowserSuccess } from '../src/features/store/directpay-checkout.js';

describe('DirectPay browser callback handling', () => {
  it('treats browser SUCCESS only as a transition to server confirmation', () => {
    expect(isDirectPayBrowserSuccess({ data: { status: 'SUCCESS' } })).toBe(true);
  });

  it('does not accept failed or malformed browser callbacks', () => {
    expect(isDirectPayBrowserSuccess({ data: { status: 'FAILED' } })).toBe(false);
    expect(isDirectPayBrowserSuccess({})).toBe(false);
  });
});
