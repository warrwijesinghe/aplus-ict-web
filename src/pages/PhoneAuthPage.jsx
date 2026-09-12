import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/auth.api.js';
import { useAuth } from '../auth/auth-context.jsx';
import { BrandLogo } from '../components/layout/BrandLogo.jsx';
import { destinationForUser, safeDestination } from '../utils/route-destination.js';
import { usePageSeo } from '../seo/use-page-seo.js';

export const PhoneAuthPage = ({ mode = 'login' }) => {
  const auth = useAuth(), navigate = useNavigate(), location = useLocation();
  const [search] = useSearchParams();
  const [step, setStep] = useState('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [challenge, setChallenge] = useState(null);
  const [verificationToken, setVerificationToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [remaining, setRemaining] = useState(0);
  const isLogin = mode === 'login', isReset = mode === 'reset';
  const returnTo = safeDestination(search.get('returnTo') || location.state?.from || sessionStorage.getItem('aplus-return-to'), '/student');
  const query = `?returnTo=${encodeURIComponent(returnTo)}`;
  usePageSeo({ path: location.pathname, title: isLogin ? 'Student sign in' : isReset ? 'Reset password' : 'Create account', description: 'Secure student account access.', noIndex: true });

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = setTimeout(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => clearTimeout(timer);
  }, [remaining]);

  const perform = async (action) => {
    setBusy(true); setError(''); setNotice('');
    try { await action(); } catch (err) { setError(err.message || 'Please try again.'); }
    finally { setBusy(false); }
  };
  const sendCode = () => perform(async () => {
    const result = await authApi.requestOtp({ phoneNumber, purpose: isReset ? 'reset' : 'register' });
    setChallenge(result); setVerificationToken(''); setCode(''); setStep('otp');
    setRemaining(result.resendAfter); setNotice(result.message);
  });
  const finishLogin = (user, newlyRegistered = false) => {
    sessionStorage.removeItem('aplus-return-to');
    const destination = safeDestination(returnTo, destinationForUser(user));
    navigate(newlyRegistered ? `/complete-profile?returnTo=${encodeURIComponent(destination)}` : destination, { replace: true });
  };
  const submit = (event) => {
    event.preventDefault();
    if (busy) return;
    if (isLogin) return perform(async () => finishLogin(await auth.login({ phoneNumber, password })));
    if (step === 'phone') return sendCode();
    if (step === 'otp') return perform(async () => {
      const result = await authApi.verifyOtp({ challengeId: challenge.challengeId, code });
      setVerificationToken(result.verificationToken); setStep('password');
    });
    return perform(async () => {
      if (password !== confirmPassword) throw new Error('Passwords do not match.');
      if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password) || new TextEncoder().encode(password).length > 72)
        throw new Error('Use at least 8 characters including a letter and a number, up to 72 bytes.');
      const input = { challengeId: challenge.challengeId, verificationToken, password, name };
      if (isReset) {
        await authApi.resetPassword(input);
        setPassword(''); setConfirmPassword(''); setVerificationToken(''); setStep('done');
      } else finishLogin(await auth.register(input), true);
    });
  };

  return <section className="student-login">
    <header className="student-login-topbar"><Link aria-label="A Plus ICT home" to="/"><BrandLogo /></Link><Link to="/courses">Explore courses →</Link></header>
    <div className="student-login-shell"><div className="student-login-main">
      <p className="eyebrow">{isLogin ? 'Student sign in' : isReset ? 'Account recovery' : 'Create your account'}</p>
      <h1>{isLogin ? 'Continue your learning.' : step === 'done' ? 'Your password is reset.' : step === 'otp' ? 'Verify your phone.' : step === 'password' ? 'Set your password.' : isReset ? 'Forgot your password?' : 'Start with your phone.'}</h1>
      <p className="student-login-lead">{isLogin ? 'Sign in with your mobile number and password.' : step === 'done' ? 'Sign in with your new password. Your previous sessions have been signed out.' : step === 'otp' ? `Enter the 6-digit code sent to ${phoneNumber}. The code expires in 5 minutes.` : step === 'password' ? 'Your phone is verified. Choose a password for your account.' : isReset ? 'We’ll send a verification code to your registered mobile number.' : 'Verify your mobile number by SMS, then choose a password.'}</p>
      {step === 'done' ? <Link className="button" to={`/login${query}`}>Back to sign in</Link> : <form className="phone-auth-form" onSubmit={submit}>
        {(isLogin || step === 'phone') && <label>Mobile number<input autoComplete="tel" type="tel" inputMode="tel" maxLength={30} placeholder="0771234567" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} /></label>}
        {!isLogin && step === 'otp' && <label>Verification code<input autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} /></label>}
        {!isLogin && step === 'password' && !isReset && <label>Full name<input autoComplete="name" maxLength={120} required value={name} onChange={(e) => setName(e.target.value)} /></label>}
        {(isLogin || step === 'password') && <label>{isLogin ? 'Password' : 'New password'}<input type="password" autoComplete={isLogin ? 'current-password' : 'new-password'} minLength={isLogin ? undefined : 8} maxLength={72} required value={password} onChange={(e) => setPassword(e.target.value)} /></label>}
        {!isLogin && step === 'password' && <><label>Confirm password<input type="password" autoComplete="new-password" minLength={8} maxLength={72} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></label><p className="field-hint">Use at least 8 characters, including a letter and a number.</p></>}
        {error && <p role="alert" className="field-error">{error}</p>}
        {notice && <p role="status">{notice}</p>}
        <button className="button" disabled={busy} type="submit">{busy ? 'Please wait…' : isLogin ? 'Sign in' : step === 'phone' ? 'Send verification code' : step === 'otp' ? 'Verify phone' : isReset ? 'Reset password' : 'Create account'}</button>
        {!isLogin && step === 'otp' && <button type="button" disabled={busy || remaining > 0} onClick={sendCode}>{remaining > 0 ? `Resend code in ${remaining}s` : 'Resend code'}</button>}
        {!isLogin && step !== 'phone' && <button type="button" disabled={busy} onClick={() => { setStep('phone'); setChallenge(null); setVerificationToken(''); setError(''); setNotice(''); setPassword(''); setConfirmPassword(''); }}>Start again</button>}
      </form>}
      <nav className="phone-auth-links" aria-label="Account options">{isLogin ? <><Link to={`/register${query}`}>Create an account</Link><Link to={`/forgot-password${query}`}>Forgot password?</Link></> : <Link to={`/login${query}`}>Back to sign in</Link>}</nav>
      {!isLogin && <p className="student-login-note">Previously signed in with Google? Contact support to connect your existing account to a mobile number, then use password reset.</p>}
    </div><aside className="student-login-visual"><div className="student-login-visual-copy"><p className="eyebrow">LEARN ON YOUR TERMS</p><h2>Your learning is ready when you are.</h2><ul><li>Return to lessons from any device</li><li>Keep your completed activities and progress</li><li>Explore free learning before unlocking premium lessons</li></ul></div><p className="student-login-visual-mark" aria-hidden="true">A+</p></aside></div>
  </section>;
};
