import { PortalLayout } from './PortalLayout.jsx';
export const StudentLayout = () => (
  <PortalLayout
    title="My learning"
    links={[
      { to: '/student/explore', label: 'Explore courses' },
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/my-courses', label: 'My courses' },
      { to: '/learning-history', label: 'Learning history' },
      { to: '/student/orders', label: 'My orders' },
      { to: '/profile', label: 'Profile' }
    ]}
  />
);
