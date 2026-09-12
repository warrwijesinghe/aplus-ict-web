import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  // Refresh tokens rotate on use. React Strict Mode re-runs effects in development,
  // so a second restore request would otherwise invalidate the freshly issued token.
  const hasStartedSessionRestore = useRef(false);
  const clearSession = useCallback(() => {
    authMemory.clear();
    setUser(null);
    queryClient.clear();
  }, []);
  const refreshSession = useCallback(async () => {
    const result = await authApi.refresh();
    authMemory.set(result.accessToken);
    const current = await authApi.me();
    const user = normalizeUser(current.user || current);
    setUser(user);
    return user;
  }, []);
  useEffect(() => {
    configureRefreshQueue({ refresh: refreshSession, onSessionFailure: clearSession });

    if (hasStartedSessionRestore.current) return;
    hasStartedSessionRestore.current = true;

    refreshSession()
      .catch(clearSession)
      .finally(() => setIsRestoringSession(false));
  }, [clearSession, refreshSession]);
  const establish = useCallback(async (action, input) => {
    const result = await action(input);
    queryClient.clear();
    authMemory.set(result.accessToken);
    const user = normalizeUser(result.user);
    setUser(user);
    return user;
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
      reviewerLogin: (input) => establish(authApi.reviewerLogin, input),
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
