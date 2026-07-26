import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './auth-context.jsx';
export const ProtectedRoute = () => {
  const { isAuthenticated, isRestoringSession } = useAuth();
  const location = useLocation();
  if (isRestoringSession)
    return (
      <main className="page">
        <p aria-live="polite">Restoring your session…</p>
      </main>
    );
  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate replace state={{ from: location.pathname }} to="/login" />
  );
};
