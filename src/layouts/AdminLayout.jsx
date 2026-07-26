import { PortalLayout } from './PortalLayout.jsx';
export const AdminLayout = () => (
  <PortalLayout
    title="Administration"
    links={[
      { to: '/admin', label: 'Dashboard' },
      { to: '/admin/content/courses', label: 'Content' },
      { to: '/admin/learning/enrolments', label: 'Learning' },
      { to: '/admin/resources', label: 'Resources' },
      { to: '/admin/commerce/products', label: 'Commerce' }
    ]}
  />
);
