import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './auth-context.jsx';
export const RoleRoute = ({ roles }) => {
  const { hasRole } = useAuth();
  return roles.some(hasRole) ? <Outlet /> : <Navigate replace to="/unauthorized" />;
};
