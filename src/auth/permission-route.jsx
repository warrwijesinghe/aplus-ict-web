import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './auth-context.jsx';
export const PermissionRoute = ({ permissions }) => {
  const { hasAnyPermission } = useAuth();
  return hasAnyPermission(permissions) ? <Outlet /> : <Navigate replace to="/unauthorized" />;
};
