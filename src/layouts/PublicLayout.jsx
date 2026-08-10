import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { PublicFooter } from '../components/layout/PublicFooter.jsx';
import { PublicHeader } from '../components/layout/PublicHeader.jsx';

export const PublicLayout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    if (!location.hash) window.scrollTo({ left: 0, top: 0 });
  }, [location.hash, location.pathname, location.search]);

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <PublicHeader />
      <main className={`page${isHomePage ? ' homepage-main' : ''}`} id="main">
        <Outlet />
      </main>
      <PublicFooter />
    </>
  );
};
