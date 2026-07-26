import { describe, expect, test } from 'vitest';
import { normalizeApiError } from '../src/api/api-error.js';
import { hasPermission, hasRole } from '../src/auth/authorization.js';
import { formatCurrency } from '../src/utils/currency.js';
import { formatDate } from '../src/utils/date-time.js';
import { destinationForUser, safeDestination } from '../src/utils/route-destination.js';
import { safeExternalUrl } from '../src/utils/safe-url.js';

describe('utilities', () => {
  test('formats LKR amounts', () => expect(formatCurrency('2500')).toMatch(/2,500\.00/));
  test('handles invalid dates safely', () => expect(formatDate('not-a-date')).toBe('—'));
  test('allows only local destinations', () => {
    expect(safeDestination('/student')).toBe('/student');
    expect(safeDestination('//bad.example')).toBe('/');
  });
  test('accepts HTTPS external URLs only', () => {
    expect(safeExternalUrl('https://example.com/path')).toBe('https://example.com/path');
    expect(safeExternalUrl('javascript:alert(1)')).toBeNull();
  });
  test('checks roles and permissions from the auth contract', () => {
    const user = { roles: [{ code: 'student' }], permissions: ['learning.progress.read'] };
    expect(hasRole(user, 'student')).toBe(true);
    expect(hasPermission(user, 'learning.progress.read')).toBe(true);
    expect(destinationForUser(user)).toBe('/student');
  });
  test('normalizes network errors without leaking internals', () => {
    const error = normalizeApiError({ code: 'ECONNABORTED' }, 'content');
    expect(error.code).toBe('TIMEOUT');
    expect(error.service).toBe('content');
  });
});
