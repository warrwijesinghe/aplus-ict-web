import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { contentApi } from '../api/content.api.js';
import { queryKeys } from '../api/query-keys.js';
import { useAuth } from '../auth/auth-context.jsx';
import { InlineError, LoadingSkeleton } from '../components/common/States.jsx';
import { useEnrollInCourse, useStudentProfile } from '../features/student/hooks.js';
import { isProfileComplete } from '../features/student/student-learning.js';

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
  if (!isAuthenticated) return <section className="form-card"><h1>Login to enroll</h1><p>Sign in with Google, complete your student profile once, then confirm this free enrollment.</p><button onClick={() => { sessionStorage.setItem('aplus-return-to', location.pathname); startGoogleLogin(); }} type="button">Continue with Google</button></section>;
  if (!isProfileComplete(profile.data)) return <Navigate replace to={`/complete-profile?returnTo=${encodeURIComponent(location.pathname)}`} />;

  const submit = async () => {
    await enroll.mutateAsync(course);
    navigate(`/courses/${course.slug}/learn`, { state: { enrolled: true }, replace: true });
  };

  return <section className="form-card enrollment-form"><p className="eyebrow">Free course enrollment</p><h1>{course.title}</h1><p><strong>Medium:</strong> {course.medium?.name || course.medium?.code} · <strong>Fee:</strong> Free</p><p>Your completed student profile will be used for this enrollment. <Link to="/student/profile">Edit profile</Link></p>{enroll.error && <InlineError error={enroll.error} />}{confirming ? <><p>Would you like to enroll in this course now?</p><div className="course-detail-actions"><button disabled={enroll.isPending} onClick={submit} type="button">{enroll.isPending ? 'Enrolling…' : 'Yes, enroll me'}</button><button disabled={enroll.isPending} onClick={() => setConfirming(false)} type="button">Cancel</button></div></> : <button onClick={() => setConfirming(true)} type="button">Enroll in this course</button>}</section>;
};
