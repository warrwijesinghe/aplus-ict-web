import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { safeDestination } from '../../utils/route-destination.js';
import '../../styles/guest-enrollment.css';

export const GuestEnrollment = ({ course, lesson }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const requested = safeDestination(new URLSearchParams(location.search).get('returnTo'), '');
  const lessonPrefix = `/courses/${course.slug}/lessons/`;
  const lessonMatch = requested.startsWith(lessonPrefix) && requested.match(/^(\/courses\/[^/]+\/lessons\/[^/?#]+)(?:\/|$)/);
  const backTo = lessonMatch ? lessonMatch[1] : `/courses/${course.slug}`;
  const medium = typeof course.medium === 'string' ? course.medium : course.medium?.nameEn || course.medium?.name || course.medium?.code;
  const level = course.academicLevel?.nameEn || course.academicLevel?.name || course.academicLevel?.code?.replaceAll('_', ' ') || course.courseGroup?.replaceAll('_', ' ');
  const submit = (event) => {
    event.preventDefault();
    const cleaned = phone.replace(/[\s()-]/g, '');
    const national = cleaned.replace(/^(?:\+94|94|0)/, '');
    if (!/^7\d{8}$/.test(national)) { setError('Enter a valid Sri Lankan mobile number, such as 77 123 4567.'); return; }
    setError('');
    navigate(`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`, { state: { phoneNumber: `+94${national}` } });
  };
  return <div className="guest-enrollment">
    <a className="skip" href="#enrollment-main">Skip to content</a>
    <header className="guest-enrollment-header">
      <Link className="guest-enrollment-brand" to="/" aria-label="A Plus ICT home">A<span>+Plus</span> ICT</Link>
      <Link className="guest-enrollment-back" to={backTo}><ArrowLeft size={14} aria-hidden="true" />{lessonMatch ? 'Back to lesson' : 'Back to course'}</Link>
    </header>
    <main className="guest-enrollment-main" id="enrollment-main">
      <div className="guest-enrollment-shell">
        <section className="guest-enrollment-card" aria-labelledby="guest-enrollment-title">
          <h1 id="guest-enrollment-title">Start learning</h1>
          <p className="guest-enrollment-lead">Sign in with your phone to access free lesson content.</p>
          <div className="guest-enrollment-course"><p>{[level, medium].filter(Boolean).join(' · ')}</p>{lesson && <p>{course.titleEn || course.title}</p>}<h2>{lesson?.title || course.titleEn || course.title}</h2></div>
          <form onSubmit={submit}>
            <label className="sr-only" htmlFor="enrollment-phone">Mobile number</label>
            <div className="guest-enrollment-phone"><span aria-hidden="true">+94</span><input id="enrollment-phone" type="tel" autoComplete="tel-national" inputMode="tel" placeholder="77 123 4567" maxLength={20} required value={phone} aria-invalid={Boolean(error)} aria-describedby={error ? 'enrollment-phone-error' : undefined} onChange={(event) => { setPhone(event.target.value); setError(''); }} /></div>
            {error && <p className="guest-enrollment-error" id="enrollment-phone-error" role="alert">{error}</p>}
            <button type="submit">Continue</button>
          </form>
          <p className="guest-enrollment-reassurance"><Check size={13} aria-hidden="true" />Free to start <span>·</span> Secure phone sign-in</p>
        </section>
        <p className="guest-enrollment-note">Use your A Plus ICT account to continue learning.</p>
      </div>
    </main>
  </div>;
};
