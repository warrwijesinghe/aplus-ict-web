import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/auth-context.jsx';
import { destinationForUser } from '../utils/route-destination.js';
import { usePageSeo } from '../seo/use-page-seo.js';

export const ReviewAccessPage = () => {
  const { reviewerLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  usePageSeo({ path: '/review-access', title: 'Platform Review Access', noIndex: true });

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const user = await reviewerLogin({ email, password });
      navigate(destinationForUser(user), { replace: true });
    } catch (requestError) {
      setError(requestError?.message || 'We could not sign you in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="form-card review-access-card">
      <p className="eyebrow">A Plus ICT</p>
      <h1>Platform Review Access</h1>
      <p>This login is provided for authorized platform review purposes.</p>
      <form onSubmit={submit}>
        <label>
          Email
          <input autoComplete="username" disabled={isSubmitting} onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
        </label>
        <label>
          Password
          <input autoComplete="current-password" disabled={isSubmitting} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
        </label>
        {error ? <p className="field-error" role="alert">{error}</p> : null}
        <button disabled={isSubmitting} type="submit">{isSubmitting ? 'Signing in…' : 'Sign In'}</button>
      </form>
    </section>
  );
};
