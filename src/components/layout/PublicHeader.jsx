import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { contentApi } from '../../api/content.api.js';
import { queryKeys } from '../../api/query-keys.js';
import { serviceUrls } from '../../api/service-urls.js';
import { useAuth } from '../../auth/auth-context.jsx';
import { destinationForUser } from '../../utils/route-destination.js';
import { BrandLogo } from './BrandLogo.jsx';

export const PublicHeader = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMemberOpen, setIsMemberOpen] = useState(false);
  const profile = useQuery({
    queryKey: queryKeys.content.siteProfile,
    queryFn: ({ signal }) => contentApi.siteProfile(signal),
    retry: false
  });
  const brand = profile.data?.data;
  const closeMenu = () => {
    setIsOpen(false);
    setIsMemberOpen(false);
  };
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeMenu();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.classList.toggle('navigation-open', isOpen);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('navigation-open');
    };
  }, [isOpen]);
  const roles = user?.roles?.map((role) => (typeof role === 'string' ? role : role.code)) || [];
  const loginReturnTo = encodeURIComponent(location.pathname + location.search);
  const memberDestination = destinationForUser(user);
  const initials = (user?.name || user?.email || 'Student')
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <header className="header">
      <Link className="brand" to="/">
        <BrandLogo brandName={brand?.brandName} />
      </Link>
      <button
        aria-label="Toggle navigation menu"
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
          A/L Courses
        </NavLink>
        <NavLink onClick={closeMenu} to="/resources">
          Free Resources
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
          <div className="member-menu">
            <button
              aria-expanded={isMemberOpen}
              className="member-menu-trigger"
              onClick={() => setIsMemberOpen((open) => !open)}
              type="button"
            >
              <span aria-hidden="true" className="member-avatar">
                {initials}
              </span>
              <span className="member-menu-label">
                {roles.includes('student') ? 'My learning' : 'Account'}
              </span>
            </button>
            {isMemberOpen ? (
              <div className="member-menu-popover">
                <p>
                  <strong>{user?.name || 'A Plus ICT member'}</strong>
                  <span>{user?.email}</span>
                </p>
                <Link onClick={closeMenu} to={memberDestination}>
                  My learning
                </Link>
                {roles.includes('student') ? (
                  <Link onClick={closeMenu} to="/student/profile">
                    Profile
                  </Link>
                ) : null}
                <Link onClick={closeMenu} to="/logout">
                  Log out
                </Link>
              </div>
            ) : null}
          </div>
        ) : (
          <a
            className="header-login"
            href={serviceUrls.auth + '/api/v1/auth/google?returnTo=' + loginReturnTo}
            onClick={closeMenu}
          >
            Start Learning
          </a>
        )}
      </nav>
    </header>
  );
};
