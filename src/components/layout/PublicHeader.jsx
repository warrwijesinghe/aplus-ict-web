import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { contentApi } from '../../api/content.api.js';
import { queryKeys } from '../../api/query-keys.js';
import { serviceUrls } from '../../api/service-urls.js';
import { useAuth } from '../../auth/auth-context.jsx';
import { destinationForUser } from '../../utils/route-destination.js';
import { BrandLogo } from './BrandLogo.jsx';
import { trackPublicEvent } from '../../analytics/events.js';

export const PublicHeader = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMemberOpen, setIsMemberOpen] = useState(false);
  const headerRef = useRef(null);
  const menuButtonRef = useRef(null);
  const navigationRef = useRef(null);
  const profile = useQuery({
    queryKey: queryKeys.content.siteProfile,
    queryFn: ({ signal }) => contentApi.siteProfile(signal),
    retry: false
  });
  const brand = profile.data?.data;
  const closeMenu = ({ restoreFocus = false } = {}) => {
    setIsOpen(false);
    setIsMemberOpen(false);
    if (restoreFocus) requestAnimationFrame(() => menuButtonRef.current?.focus());
  };
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) closeMenu({ restoreFocus: true });
    };
    const onPointerDown = (event) => {
      if ((isOpen || isMemberOpen) && !headerRef.current?.contains(event.target)) closeMenu();
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    document.body.classList.toggle('navigation-open', isOpen);
    if (isOpen) requestAnimationFrame(() => navigationRef.current?.querySelector('a')?.focus());
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
      document.body.classList.remove('navigation-open');
    };
  }, [isOpen, isMemberOpen]);
  useEffect(() => {
    closeMenu();
  }, [location.pathname, location.search]);
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
    <>
      <div className="announcement-bar"><span className="announcement-desktop">Online ICT Learning for Grades 6–13 · Sinhala &amp; English Medium</span><span className="announcement-mobile">Grades 6–13 · Sinhala &amp; English Medium</span></div>
      <header className={`header${location.pathname === '/' ? ' homepage-header' : ''}`} ref={headerRef}>
      <div className="public-header-inner">
      <Link aria-label="A Plus ICT home" className="brand" to="/">
        <BrandLogo brandName={brand?.brandName} />
      </Link>
      <button
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-controls="public-navigation"
        aria-expanded={isOpen}
        className="menu-toggle"
        onClick={() => isOpen ? closeMenu({ restoreFocus: true }) : setIsOpen(true)}
        ref={menuButtonRef}
        type="button"
      >
        <span className="sr-only">Toggle navigation</span>
        <span aria-hidden="true">☰</span>
      </button>
      <nav aria-label="Main navigation" className={isOpen ? 'open' : ''} id="public-navigation" ref={navigationRef}>
        <NavLink onClick={closeMenu} to="/school-ict">Grades 6–9</NavLink>
        <NavLink onClick={closeMenu} to="/ol-ict">O/L ICT</NavLink>
        <NavLink onClick={closeMenu} to="/al-ict">A/L ICT</NavLink>
        <NavLink onClick={closeMenu} to="/resources">
          Free Resources
        </NavLink>
        <NavLink onClick={closeMenu} to="/about">
          About
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
                {roles.includes('student') ? 'My Learning' : 'Account'}
              </span>
            </button>
            {isMemberOpen ? (
              <div className="member-menu-popover">
                <p>
                  <strong>{user?.name || 'A Plus ICT member'}</strong>
                  <span>{user?.email}</span>
                </p>
                <Link onClick={closeMenu} to={memberDestination}>
                  My Learning
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
            onClick={() => { trackPublicEvent('student_login_started'); closeMenu(); }}
          >
            Student Login
          </a>
        )}
      </nav>
      </div>
      </header>
      {isOpen ? <button aria-label="Close navigation" className="navigation-backdrop" onClick={() => closeMenu({ restoreFocus: true })} type="button" /> : null}
    </>
  );
};
