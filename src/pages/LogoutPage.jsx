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
    <section className="form-card logout-card">
      <p className="eyebrow">Student session</p>
      <h1>{isComplete ? 'You are logged out' : 'Logging you out...'}</h1>
      <p>
        {isComplete
          ? 'Your learning session has been safely cleared on this device.'
          : 'Please wait while we securely close your learning session.'}
      </p>
      {isComplete ? (
        <div className="logout-actions">
          <Link className="button" to="/">
            Return home
          </Link>
          <Link className="button secondary" to="/login">
            Continue with Google
          </Link>
        </div>
      ) : null}
    </section>
  );
};
