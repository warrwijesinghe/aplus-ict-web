import { PortalLayout } from './PortalLayout.jsx';
export const StudentLayout = () => (
  <PortalLayout
    title="My Learning"
    links={[
      { to: '/dashboard', label: 'My Learning' },
      { to: '/my-orders', label: 'My orders' },
      { to: '/profile', label: 'Profile' }
    ]}
  />
);
