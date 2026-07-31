import { useCallback, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/auth.api.js';
import { configureRefreshQueue } from '../api/refresh-queue.js';
import { queryClient } from '../app/query-client.js';
import { authMemory } from './auth-memory.js';
import { hasAnyPermission, hasPermission, hasRole } from './authorization.js';
import { AuthContext } from './auth-context.jsx';

// The API currently returns one role as "role"; route guards use a roles array.
// Normalising at this boundary keeps every client component on one user shape.
const normalizeUser = (user) => ({
  ...user,
  permissions: user?.permissions || [],
  roles: user?.roles || (user?.role ? [user.role] : [])
});

const isGoogleCallbackRoute = () => window.location.pathname === '/login/success';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const clearSession = useCallback(() => {
    authMemory.clear();
    setUser(null);
    queryClient.removeQueries({ queryKey: ['auth'] });
    queryClient.removeQueries({ queryKey: ['learning'] });
    queryClient.removeQueries({ queryKey: ['commerce', 'orders'] });
  }, []);
  const refreshSession = useCallback(async () => {
    const result = await authApi.refresh();
    authMemory.set(result.accessToken);
    const current = await authApi.me();
    const user = normalizeUser(current.user);
    setUser(user);
    return user;
  }, []);
  useEffect(() => {
    configureRefreshQueue({ refresh: refreshSession, onSessionFailure: clearSession });

    // The callback page validates the one-time fragment token itself. Skipping
    // the automatic refresh here avoids a stale refresh failure clearing that
    // newly received access token during the callback.
    if (isGoogleCallbackRoute()) {
      setIsRestoringSession(false);
      return;
    }

    refreshSession()
      .catch(clearSession)
      .finally(() => setIsRestoringSession(false));
  }, [clearSession, refreshSession]);
  const establish = useCallback(async (action, input) => {
    const result = await action(input);
    authMemory.set(result.accessToken);
    const current = await authApi.me();
    const user = normalizeUser(current.user);
    setUser(user);
    return user;
  }, []);
  const completeGoogleLogin = useCallback(
    async (accessToken) => {
      setIsRestoringSession(true);
      authMemory.set(accessToken);

      try {
        const current = await authApi.me();
        const user = normalizeUser(current.user);
        setUser(user);
        return user;
      } catch (error) {
        clearSession();
        throw error;
      } finally {
        setIsRestoringSession(false);
      }
    },
    [clearSession]
  );
  const value = useMemo(
    () => ({
      user,
      isRestoringSession,
      isAuthenticated: Boolean(user && authMemory.get()),
      accessTokenAvailable: Boolean(authMemory.get()),
      roles: user?.roles || [],
      permissions: user?.permissions || [],
      login: (input) => establish(authApi.login, input),
      register: (input) => establish(authApi.register, input),
      startGoogleLogin: authApi.login,
      completeGoogleLogin,
      refreshSession,
      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          clearSession();
        }
      },
      logoutAll: async () => {
        try {
          await authApi.logoutAll();
        } finally {
          clearSession();
        }
      },
      hasRole: (role) => hasRole(user, role),
      hasPermission: (permission) => hasPermission(user, permission),
      hasAnyPermission: (permissions) => hasAnyPermission(user, permissions)
    }),
    [clearSession, completeGoogleLogin, establish, isRestoringSession, refreshSession, user]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
