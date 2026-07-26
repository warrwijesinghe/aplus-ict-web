import { PortalLayout } from './PortalLayout.jsx';
export const TeacherLayout = () => (
  <PortalLayout
    title="Teacher portal"
    links={[
      { to: '/teacher', label: 'Dashboard' },
      { to: '/teacher/content', label: 'My content' },
      { to: '/teacher/content/courses', label: 'Courses' }
    ]}
  />
);
