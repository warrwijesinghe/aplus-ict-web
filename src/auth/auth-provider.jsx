import { useCallback, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/auth.api.js';
import { configureRefreshQueue } from '../api/refresh-queue.js';
import { queryClient } from '../app/query-client.js';
import { authMemory } from './auth-memory.js';
import { hasAnyPermission, hasPermission, hasRole } from './authorization.js';
import { AuthContext } from './auth-context.jsx';

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
    setUser(current.user);
    return current.user;
  }, []);
  useEffect(() => {
    configureRefreshQueue({ refresh: refreshSession, onSessionFailure: clearSession });
    refreshSession()
      .catch(clearSession)
      .finally(() => setIsRestoringSession(false));
  }, [clearSession, refreshSession]);
  const establish = useCallback(async (action, input) => {
    const result = await action(input);
    authMemory.set(result.accessToken);
    const current = await authApi.me();
    setUser(current.user);
    return current.user;
  }, []);
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
    [clearSession, establish, isRestoringSession, refreshSession, user]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
