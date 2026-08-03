import { StrictMode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AuthProvider } from '../src/auth/auth-provider.jsx';
import { useAuth } from '../src/auth/auth-context.jsx';
import { authMemory } from '../src/auth/auth-memory.js';
import { authApi } from '../src/api/auth.api.js';

vi.mock('../src/api/auth.api.js', () => ({
  authApi: {
    refresh: vi.fn(),
    me: vi.fn()
  }
}));

const SessionStatus = () => {
  const { isAuthenticated, user } = useAuth();
  return <p>{isAuthenticated ? `${user.email}:${user.roles.join(',')}` : 'signed-out'}</p>;
};

describe('AuthProvider', () => {
  beforeEach(() => {
    authMemory.clear();
    window.history.replaceState({}, '', '/');
    vi.clearAllMocks();
  });

  test('restores a rotating refresh-token session only once in Strict Mode', async () => {
    authApi.refresh.mockResolvedValue({ accessToken: 'restored-access-token' });
    authApi.me.mockResolvedValue({
      id: 'student-1',
      email: 'student@example.com',
      role: 'student'
    });

    render(
      <StrictMode>
        <AuthProvider>
          <SessionStatus />
        </AuthProvider>
      </StrictMode>
    );

    await waitFor(() =>
      expect(screen.getByText('student@example.com:student')).toBeInTheDocument()
    );
    expect(authApi.refresh).toHaveBeenCalledTimes(1);
    expect(authApi.me).toHaveBeenCalledTimes(1);
  });
});
