import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, test, vi } from 'vitest';
import { useAuth } from '../src/auth/auth-context.jsx';
import { LogoutPage } from '../src/pages/LogoutPage.jsx';

vi.mock('../src/auth/auth-context.jsx', () => ({ useAuth: vi.fn() }));

afterEach(() => vi.restoreAllMocks());

test('confirms the session is cleared and provides clear next actions', async () => {
  useAuth.mockReturnValue({ logout: vi.fn().mockResolvedValue() });
  render(
    <MemoryRouter>
      <LogoutPage />
    </MemoryRouter>
  );

  await waitFor(() =>
    expect(screen.getByRole('heading', { name: 'You’re logged out' })).toBeInTheDocument()
  );
  expect(screen.getByRole('link', { name: 'Return home' })).toHaveAttribute('href', '/');
  expect(screen.getByRole('link', { name: 'Sign in again' })).toHaveAttribute('href', '/login');
});
