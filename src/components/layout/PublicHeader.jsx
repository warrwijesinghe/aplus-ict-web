import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../auth/auth-context.jsx';
import { destinationForUser } from '../../utils/route-destination.js';
export const PublicHeader = () => {
  const { isAuthenticated, user, logout } = useAuth();
  return (
    <header className="header">
      <Link className="brand" to="/">
        A Plus ICT
      </Link>
      <nav aria-label="Main navigation">
        <NavLink to="/courses">Courses</NavLink>
        <NavLink to="/store">Store</NavLink>
        {isAuthenticated ? (
          <>
            <Link to={destinationForUser(user)}>Dashboard</Link>
            <button onClick={logout} type="button">
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </nav>
    </header>
  );
};
