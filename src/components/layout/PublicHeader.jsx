import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, NavLink } from 'react-router-dom';
import { contentApi } from '../../api/content.api.js';
import { queryKeys } from '../../api/query-keys.js';
import { serviceUrls } from '../../api/service-urls.js';
import { useAuth } from '../../auth/auth-context.jsx';
import { destinationForUser } from '../../utils/route-destination.js';
import { BrandLogo } from './BrandLogo.jsx';

export const PublicHeader = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const profile = useQuery({
    queryKey: queryKeys.content.siteProfile,
    queryFn: ({ signal }) => contentApi.siteProfile(signal),
    retry: false
  });
  const brand = profile.data?.data;
  const closeMenu = () => setIsOpen(false);
  const roles = user?.roles?.map((role) => (typeof role === 'string' ? role : role.code)) || [];
  return (
    <header className="header">
      <Link className="brand" to="/">
        <BrandLogo brandName={brand?.brandName} resourceId={brand?.logoResourceId} />
      </Link>
      <button
        aria-controls="public-navigation"
        aria-expanded={isOpen}
        className="menu-toggle"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <span className="sr-only">Toggle navigation</span>
        <span aria-hidden="true">☰</span>
      </button>
      <nav aria-label="Main navigation" className={isOpen ? 'open' : ''} id="public-navigation">
        <NavLink onClick={closeMenu} to="/">
          Home
        </NavLink>
        <NavLink onClick={closeMenu} to="/courses">
          Courses
        </NavLink>
        <NavLink onClick={closeMenu} to="/student-guide">
          Student Guide
        </NavLink>
        <NavLink onClick={closeMenu} to="/about">
          About Us
        </NavLink>
        <NavLink onClick={closeMenu} to="/contact">
          Contact Us
        </NavLink>
        {isAuthenticated ? (
          <>
            <Link onClick={closeMenu} to={destinationForUser(user)}>
              {roles.includes('student') ? 'My Learning' : 'Go to Dashboard'}
            </Link>
            <button onClick={logout} type="button">
              Logout
            </button>
          </>
        ) : (
          <a
            className="header-login"
            href={`${serviceUrls.auth}/api/v1/auth/google?returnTo=/courses`}
            onClick={closeMenu}
          >
            Continue with Google
          </a>
        )}
      </nav>
    </header>
  );
};
