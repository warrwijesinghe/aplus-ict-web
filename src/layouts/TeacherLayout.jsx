import { PortalLayout } from './PortalLayout.jsx';
export const TeacherLayout = () => (
  <PortalLayout
    title="Teacher portal"
    links={[
      { to: '/teacher', label: 'Dashboard' },
      { to: '/teacher/courses', label: 'Assigned courses' }
    ]}
  />
);
