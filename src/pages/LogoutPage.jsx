import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/auth-context.jsx';

// Logging out has its own public confirmation page, so students never remain
// on a private LMS screen after their session is cleared.
export const LogoutPage = () => {
  const { logout } = useAuth();
  const [isComplete, setIsComplete] = useState(false);
  const hasLoggedOut = useRef(false);

  useEffect(() => {
    if (hasLoggedOut.current) return;
    hasLoggedOut.current = true;

    logout().finally(() => setIsComplete(true));
  }, [logout]);

  return (
    <section aria-labelledby="logout-title" className="logout-page">
      <div className="logout-card" role="status">
        <div aria-hidden="true" className={`logout-status-icon${isComplete ? ' complete' : ''}`}>
          {isComplete ? '✓' : <span className="logout-spinner" />}
        </div>
        <p className="eyebrow">Student session</p>
        <h1 id="logout-title">{isComplete ? 'You’re logged out' : 'Logging you out…'}</h1>
        <p className="logout-message">
          {isComplete
            ? 'Your learning session has been safely cleared from this device.'
            : 'Please wait while we securely close your learning session.'}
        </p>
        {isComplete ? (
          <div className="logout-actions">
            <Link className="button" to="/">
              Return home
            </Link>
            <Link className="button secondary" to="/login">
              Sign in again
            </Link>
          </div>
        ) : null}
        {isComplete ? <p className="logout-reassurance">You can sign in again whenever you’re ready.</p> : null}
      </div>
    </section>
  );
};
