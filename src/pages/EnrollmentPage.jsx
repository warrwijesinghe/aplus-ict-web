import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { contentApi } from '../api/content.api.js';
import { queryKeys } from '../api/query-keys.js';
import { useAuth } from '../auth/auth-context.jsx';
import { EmptyState, InlineError, LoadingSkeleton } from '../components/common/States.jsx';
import { useEnrollInCourse, useStudentProfile } from '../features/student/hooks.js';
import { isProfileComplete } from '../features/student/student-learning.js';

const CourseIcon = () => <svg aria-hidden="true" fill="none" focusable="false" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4.5 5.5A2.5 2.5 0 0 1 7 3h4.5v16H7a2.5 2.5 0 0 0-2.5 2.5v-16ZM19.5 5.5A2.5 2.5 0 0 0 17 3h-4.5v16H17a2.5 2.5 0 0 0-2.5 2.5v-16Z" /></svg>;
const CheckIcon = () => <svg aria-hidden="true" fill="none" focusable="false" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24"><path d="m5 12.5 4.2 4.2L19.5 6.5" /></svg>;

export const EnrollmentPage = () => {
  const { courseSlug } = useParams();
  const { isAuthenticated, startGoogleLogin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const courseQuery = useQuery({ queryKey: queryKeys.content.publicCourse(courseSlug), queryFn: ({ signal }) => contentApi.publicCourse(courseSlug, signal) });
  const profile = useStudentProfile(isAuthenticated);
  const enroll = useEnrollInCourse();

  if (courseQuery.isLoading || (isAuthenticated && profile.isLoading)) return <LoadingSkeleton />;
  if (courseQuery.isError) return <InlineError error={courseQuery.error} />;
  const course = courseQuery.data?.data;
  if (!course) return <EmptyState title="This course is not available" />;

  const medium = course.medium?.name || course.medium?.code || 'Selected medium';
  const level = course.academicLevel?.name || course.academicLevel?.code || 'ICT course';
  const heading = isAuthenticated ? 'Confirm your enrollment' : 'Start learning with this course';

  if (!isAuthenticated) return <section className="enrollment-page"><div className="enrollment-shell enrollment-login-shell">
    <header className="enrollment-intro"><p className="eyebrow">Course enrollment</p><h1>{heading}</h1><p>Sign in with Google first. You’ll complete your profile once, then confirm your place in the course.</p></header>
    <article className="enrollment-login-card"><span className="enrollment-course-icon"><CourseIcon /></span><div><p className="eyebrow">{level} · {medium}</p><h2>{course.title}</h2><p>Free content is available. Some lessons may require purchase to unlock.</p></div><button className="button" onClick={() => { sessionStorage.setItem('aplus-return-to', location.pathname); startGoogleLogin(); }} type="button">Continue with Google</button></article>
  </div></section>;

  if (!isProfileComplete(profile.data)) return <Navigate replace to={`/complete-profile?returnTo=${encodeURIComponent(location.pathname)}`} />;

  const submit = async () => {
    await enroll.mutateAsync(course);
    navigate(`/courses/${course.slug}/learn`, { state: { enrolled: true }, replace: true });
  };

  return <section className="enrollment-page"><div className="enrollment-shell">
    <header className="enrollment-intro"><p className="eyebrow">Course enrollment</p><h1>{heading}</h1><p>Review the course below, then confirm to add it to your learning dashboard.</p></header>
    <div className="enrollment-layout">
      <article className="enrollment-course-card">
        <div className="enrollment-course-card-heading"><span className="enrollment-course-icon"><CourseIcon /></span><span className="enrollment-free-badge">Free content available</span></div>
        <p className="eyebrow">{level}</p><h2>{course.title}</h2>
        <dl><div><dt>Medium</dt><dd>{medium}</dd></div><div><dt>Access</dt><dd>Free and paid lessons</dd></div></dl>
        <p className="enrollment-course-note"><CheckIcon /> Free content is available after enrolling. Some lessons may require purchase to unlock.</p>
      </article>
      <article className="enrollment-confirm-card">
        <div><p className="eyebrow">Your enrollment</p><h2>Ready to join?</h2><p>We’ll use your completed student profile for this course.</p></div>
        <div className="enrollment-profile-note"><span aria-hidden="true"><CheckIcon /></span><p><strong>Student profile ready</strong><br /><Link to="/student/profile">Edit profile details</Link></p></div>
        {enroll.error ? <InlineError error={enroll.error} /> : null}
        {confirming ? <div className="enrollment-confirmation" role="status"><p><strong>Enroll in this course now?</strong><br />You can start learning immediately after confirmation.</p><div><button className="button" disabled={enroll.isPending} onClick={submit} type="button">{enroll.isPending ? 'Enrolling…' : 'Yes, enroll me'}</button><button className="enrollment-cancel" disabled={enroll.isPending} onClick={() => setConfirming(false)} type="button">Go back</button></div></div> : <button className="button enrollment-primary-action" onClick={() => setConfirming(true)} type="button">Enroll Free Now</button>}
      </article>
    </div>
  </div></section>;
};
