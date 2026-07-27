import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../auth/auth-context.jsx';
import { destinationForUser } from '../../utils/route-destination.js';
export const PublicHeader = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => setIsOpen(false);
  return (
    <header className="header">
      <Link className="brand" to="/">
        A Plus ICT
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
        <NavLink onClick={closeMenu} to="/al-ict">
          A/L ICT
        </NavLink>
        <NavLink onClick={closeMenu} to="/al-ict/sinhala-medium">
          සිංහල මාධ්‍ය
        </NavLink>
        <NavLink onClick={closeMenu} to="/al-ict/english-medium">
          English Medium
        </NavLink>
        <Link onClick={closeMenu} to="/al-ict#free-lessons">
          Free Lessons
        </Link>
        <Link onClick={closeMenu} to="/#how-it-works">
          How It Works
        </Link>
        <Link onClick={closeMenu} to="/#about">
          About
        </Link>
        {isAuthenticated ? (
          <>
            <Link onClick={closeMenu} to={destinationForUser(user)}>
              Go to Dashboard
            </Link>
            <button onClick={logout} type="button">
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink className="header-login" onClick={closeMenu} to="/login">
              Student Login
            </NavLink>
          </>
        )}
      </nav>
    </header>
  );
};
