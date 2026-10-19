import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { BookOpen, LayoutDashboard, UserRound } from 'lucide-react';
import { useAuth } from '../auth/auth-context.jsx';
import { BrandLogo } from '../components/layout/BrandLogo.jsx';
import '../styles/student-portal.css';

export const PortalLayout = ({ title, links }) => {
  const { user } = useAuth();
  const location = useLocation();
  const initials = (user?.name || user?.email || 'Student').split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  return <div className="portal portal-minimal">
    <aside className="portal-sidebar" id="student-navigation">
      <Link aria-label="A Plus ICT home" className="portal-brand" to="/"><BrandLogo variant="light" /></Link>
      <div className="portal-heading"><span>Student portal</span><h1>{title}</h1></div>
      <div className="portal-member"><span aria-hidden="true" className="member-avatar">{initials}</span><p><strong>{user?.name || 'Student'}</strong></p></div>
      <nav aria-label="Student navigation">{links.map(({ to, label }) => <NavLink key={to} to={to} className={({ isActive }) => isActive || (to === '/my-orders' && location.pathname.startsWith('/student/orders')) || (to === '/dashboard' && location.pathname === '/my-courses') ? 'active' : undefined}>{label}</NavLink>)}</nav>
      <Link className="portal-logout" to="/logout">Log out</Link>
    </aside>
    <main className="page portal-content">
      <header className="portal-mobile-header"><Link aria-label="A Plus ICT home" className="portal-mobile-brand" to="/"><BrandLogo /></Link><details key={location.pathname} className="portal-mobile-account"><summary aria-label="Account menu"><span className="member-avatar">{initials}</span></summary><nav aria-label="Mobile account"><Link to="/my-orders">My orders</Link><Link to="/profile">Profile</Link><Link to="/logout">Log out</Link></nav></details></header>
      <div className="portal-content-inner"><Outlet /></div>
    </main>
    <nav className="student-mobile-nav" aria-label="Mobile learning navigation"><NavLink to="/dashboard"><LayoutDashboard size={19} aria-hidden="true" />My Learning</NavLink><NavLink to="/my-courses"><BookOpen size={19} aria-hidden="true" />Lessons</NavLink><NavLink to="/profile"><UserRound size={19} aria-hidden="true" />Profile</NavLink></nav>
  </div>;
};
