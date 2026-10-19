import { Outlet } from 'react-router-dom';
import { useAuth } from '../auth/auth-context.jsx';
import { PublicLayout } from './PublicLayout.jsx';

export const EnrollmentLayout = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <PublicLayout /> : <Outlet />;
};
