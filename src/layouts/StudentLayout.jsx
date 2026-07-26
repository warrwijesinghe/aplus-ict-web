import { PortalLayout } from './PortalLayout.jsx';
export const StudentLayout = () => (
  <PortalLayout
    title="Student portal"
    links={[
      { to: '/student', label: 'Dashboard' },
      { to: '/student/courses', label: 'My courses' },
      { to: '/student/orders', label: 'My orders' },
      { to: '/student/profile', label: 'Profile' }
    ]}
  />
);
