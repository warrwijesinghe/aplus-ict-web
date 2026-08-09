import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/auth-context.jsx';
import { BrandLogo } from '../components/layout/BrandLogo.jsx';

export const PortalLayout = ({ title, links }) => {
  const { user } = useAuth();
  const [navigationOpen, setNavigationOpen] = useState(false);
  const initials = (user?.name || user?.email || 'Student')
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const closeNavigation = () => setNavigationOpen(false);

  return (
    <div className={`portal${navigationOpen ? ' is-navigation-open' : ''}`}>
      <aside className="portal-sidebar" id="student-navigation">
        <Link aria-label="A Plus ICT home" className="portal-brand" onClick={closeNavigation} to="/"><BrandLogo variant="light" /></Link>
        <div className="portal-heading"><span>Student portal</span><h1>{title}</h1></div>
        <div className="portal-member">
          <span aria-hidden="true" className="member-avatar">{initials}</span>
          <p><strong>{user?.name || 'Student'}</strong><span>{user?.email}</span></p>
        </div>
        <nav aria-label={`${title} navigation`}>
          {links.map(({ to, label }) => <NavLink key={to} onClick={closeNavigation} to={to}>{label}</NavLink>)}
          <Link className="portal-logout" onClick={closeNavigation} to="/logout">Log out</Link>
        </nav>
      </aside>
      <button aria-label="Close navigation" className="portal-scrim" onClick={closeNavigation} tabIndex={navigationOpen ? 0 : -1} type="button" />
      <main className="page portal-content">
        <header className="portal-mobile-header"><button aria-controls="student-navigation" aria-expanded={navigationOpen} aria-label="Open navigation" className="portal-menu-toggle" onClick={() => setNavigationOpen(true)} type="button"><span /><span /><span /></button><Link aria-label="A Plus ICT home" className="portal-mobile-brand" to="/"><BrandLogo /></Link><span aria-hidden="true" className="member-avatar">{initials}</span></header>
        <Outlet />
      </main>
    </div>
  );
};
