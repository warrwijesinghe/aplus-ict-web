import { Outlet } from 'react-router-dom';
import { PublicHeader } from '../components/layout/PublicHeader.jsx';
export const PublicLayout = () => (
  <>
    <a className="skip" href="#main">
      Skip to content
    </a>
    <PublicHeader />
    <main id="main" className="page">
      <Outlet />
    </main>
    <footer className="footer">© {new Date().getFullYear()} A Plus ICT</footer>
  </>
);
