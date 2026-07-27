import { Outlet } from 'react-router-dom';
import { PublicFooter } from '../components/layout/PublicFooter.jsx';
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
    <PublicFooter />
  </>
);
