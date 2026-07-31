import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/auth-context.jsx';
export const PortalLayout = ({ title, links }) => {
  const { user } = useAuth();
  const initials = (user?.name || user?.email || 'Student')
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="portal">
      <aside>
        <Link className="brand" to="/">
          A Plus ICT
        </Link>
        <h1>{title}</h1>
        <div className="portal-member">
          <span aria-hidden="true" className="member-avatar">
            {initials}
          </span>
          <p>
            <strong>{user?.name || 'Student'}</strong>
            <span>{user?.email}</span>
          </p>
        </div>
        <nav aria-label={`${title} navigation`}>
          {links.map(({ to, label }) => (
            <NavLink key={to} to={to}>
              {label}
            </NavLink>
          ))}
          <Link to="/logout">Log out</Link>
        </nav>
      </aside>
      <main className="page">
        <Outlet />
      </main>
    </div>
  );
};
