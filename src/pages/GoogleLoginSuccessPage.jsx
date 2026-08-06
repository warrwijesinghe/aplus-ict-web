import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/auth-context.jsx';
import { destinationForUser } from '../utils/route-destination.js';
import { isProfileComplete, studentLearningApi } from '../features/student/student-learning.js';

// Google returns the API access token in the fragment. It is never rendered or
// logged; it is immediately removed before the authenticated user is loaded.
export const GoogleLoginSuccessPage = () => {
  const navigate = useNavigate();
  const { completeGoogleLogin, startGoogleLogin } = useAuth();
  const [error, setError] = useState('');
  const hasProcessedCallback = useRef(false);

  useEffect(() => {
    if (hasProcessedCallback.current) return;
    hasProcessedCallback.current = true;

    const token = new URLSearchParams(window.location.hash.slice(1)).get('access_token');
    // Keep the token out of browser history even when the callback fails.
    window.history.replaceState({}, document.title, '/login/success');

    if (!token) {
      setError('Google sign-in did not return an access token. Please try again.');
      return;
    }

    completeGoogleLogin(token)
      .then(async (user) => {
        const intended = sessionStorage.getItem('aplus-return-to');
        sessionStorage.removeItem('aplus-return-to');
        const destination = intended || destinationForUser(user);
        const isStudent = (user.roles || [user.role]).includes('student');
        if (isStudent && !isProfileComplete(await studentLearningApi.profile())) {
          navigate(`/complete-profile?returnTo=${encodeURIComponent(destination)}`, { replace: true });
          return;
        }
        navigate(destination, { replace: true });
      })
      .catch(() =>
        setError('We could not complete your sign-in. Please try Google sign-in again.')
      );
  }, [completeGoogleLogin, navigate]);

  if (error)
    return (
      <section className="form-card">
        <h1>Sign-in could not be completed</h1>
        <p>{error}</p>
        <button onClick={startGoogleLogin} type="button">
          Continue with Google
        </button>
        <p>
          <Link to="/">Return to the home page</Link>
        </p>
      </section>
    );

  return <p aria-live="polite">Completing secure sign-in...</p>;
};
