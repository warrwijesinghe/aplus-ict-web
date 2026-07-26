import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './auth-context.jsx';
import { destinationForUser } from '../utils/route-destination.js';
export const GuestOnlyRoute = () => {
  const { isAuthenticated, isRestoringSession, user } = useAuth();
  if (isRestoringSession)
    return (
      <main className="page">
        <p>Loading…</p>
      </main>
    );
  return isAuthenticated ? <Navigate replace to={destinationForUser(user)} /> : <Outlet />;
};
