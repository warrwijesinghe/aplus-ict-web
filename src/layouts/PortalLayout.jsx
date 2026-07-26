import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/auth-context.jsx';
export const PortalLayout = ({ title, links }) => {
  const { logout } = useAuth();
  return (
    <div className="portal">
      <aside>
        <Link className="brand" to="/">
          A Plus ICT
        </Link>
        <h1>{title}</h1>
        <nav aria-label={`${title} navigation`}>
          {links.map(({ to, label }) => (
            <NavLink key={to} to={to}>
              {label}
            </NavLink>
          ))}
          <button onClick={logout} type="button">
            Logout
          </button>
        </nav>
      </aside>
      <main className="page">
        <Outlet />
      </main>
    </div>
  );
};
