import { Navigate, useLocation } from 'react-router-dom';

export const LegacyCourseListingRedirect = () => {
  const location = useLocation();
  return <Navigate replace to={`/courses${location.search}`} />;
};
