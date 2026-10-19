import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './auth-context.jsx';
import { destinationForUser, safeDestination } from '../utils/route-destination.js';
export const GuestOnlyRoute = () => {
  const { isAuthenticated, isRestoringSession, user } = useAuth();
  const location = useLocation();
  const requested = new URLSearchParams(location.search).get('returnTo') || location.state?.from;
  const destination = safeDestination(requested, destinationForUser(user));
  if (isRestoringSession)
    return (
      <main className="page">
        <p>Loading…</p>
      </main>
    );
  return isAuthenticated ? <Navigate replace to={destination} /> : <Outlet />;
};
