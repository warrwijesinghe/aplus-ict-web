import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/auth-context.jsx';
import { EmptyState, InlineError, LoadingSkeleton, StatusBadge } from '../components/common/States.jsx';
import { isProfileComplete } from '../features/student/student-learning.js';
import { useLearningHistory, useStudentDashboard, useStudentProfile, useUnenrollFromCourse, useUpdateStudentProfile } from '../features/student/hooks.js';

const validPhone = /^(?:\+94|0)?7\d{8}$/;
const formatDate = (value) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Not started';
const targetPath = (course) => course?.continueLearning ? `/courses/${course.slug}/lessons/${course.continueLearning.lessonSlug}/activities/${course.continueLearning.activityId}` : `/courses/${course?.slug}/learn`;

export const ProfileCompletionGuard = ({ children }) => {
  const { user, isRestoringSession } = useAuth(); const profile = useStudentProfile(); const location = useLocation();
  if (isRestoringSession || profile.isLoading) return <LoadingSkeleton label="Checking your student profile" />;
  if (!user || !(user.roles || [user.role]).includes('student')) return children || <Outlet />;
  if (location.pathname === '/complete-profile' || location.pathname === '/profile') return children || <Outlet />;
  return isProfileComplete(profile.data) ? children || <Outlet /> : <Navigate replace to={`/complete-profile?returnTo=${encodeURIComponent(location.pathname)}`} />;
};

export const StudentDashboard = () => {
  const { user } = useAuth(); const data = useStudentDashboard();
  if (data.isLoading) return <LoadingSkeleton />;
  if (data.error) return <InlineError error={data.error} />;
  const dashboard = data.data; const continuation = dashboard.continueLearning;
  return <section className="member-dashboard"><p className="eyebrow">My learning</p><h1>Welcome back, {user?.name || 'student'}.</h1>
    {continuation ? <article className="student-dashboard-feature"><p className="eyebrow">Continue learning</p><h2>{continuation.title}</h2><p>{continuation.continueLearning?.title || 'Pick up where you left off.'}</p><Link className="button" to={targetPath(continuation)}>Continue Learning</Link></article> : <EmptyState title="Choose your first course"><Link className="button" to="/al-ict">Explore courses</Link></EmptyState>}
    <section><div className="member-section-heading"><h2>My Courses</h2><Link to="/my-courses">View all</Link></div><div className="student-course-grid">{dashboard.courses.slice(0, 3).map((course) => <article key={course.enrolmentId} className="student-course-card"><StatusBadge status={course.status} /><h3>{course.title}</h3><p>{course.academicLevel || 'ICT'} · {course.medium}</p><strong>{course.progress.percentage}% complete</strong><progress max="100" value={course.progress.percentage} /><small>{course.progress.completedCount} of {course.progress.requiredCount} activities · {formatDate(course.lastLearningAt)}</small><Link to={targetPath(course)}>Continue Learning</Link></article>)}</div></section>
    <section className="student-dashboard-grid"><article><h2>Recent Quiz Results</h2>{dashboard.recentQuizResults.length ? dashboard.recentQuizResults.map((item) => <p key={`${item.courseTrackId}-${item.quizId}`}>{item.courseTitle}: {item.title} — {item.percentage}%</p>) : <p>No quiz results yet.</p>}</article><article><h2>Pending Grades</h2>{dashboard.pendingGrades.length ? dashboard.pendingGrades.map((item) => <p key={`${item.courseTrackId}-${item.quizId}`}>{item.courseTitle}: {item.title}</p>) : <p>No grades are waiting.</p>}</article><article><h2>Recent Learning</h2>{dashboard.recentLearning.length ? dashboard.recentLearning.slice(0, 4).map((item) => <p key={item.id}>{item.eventType.replaceAll('_', ' ')} <small>{formatDate(item.occurredAt)}</small></p>) : <p>Your learning activity will appear here.</p>}</article></section>
  </section>;
};

export const MyCoursesPage = () => {
  const courses = useStudentDashboard(); const unenroll = useUnenrollFromCourse();
  if (courses.isLoading) return <LoadingSkeleton />; if (courses.error) return <InlineError error={courses.error} />;
  const remove = (course) => { if (window.confirm(`Unenroll from ${course.title}? Your progress will be kept if you enroll again later.`)) unenroll.mutate(course.courseTrackId); };
  return <section><p className="eyebrow">My courses</p><h1>Continue your learning</h1>{unenroll.error && <InlineError error={unenroll.error} />}{courses.data.courses.length ? <div className="student-course-grid">{courses.data.courses.map((course) => <article key={course.enrolmentId} className="student-course-card"><StatusBadge status={course.status} /><h2>{course.title}</h2><p>{course.academicLevel || 'ICT'} · {course.medium} · {course.enrolmentType}</p><progress max="100" value={course.progress.percentage} /><p><strong>{course.progress.percentage}%</strong> — {course.progress.completedCount} of {course.progress.requiredCount} required activities</p><p>Last learning: {formatDate(course.lastLearningAt)}</p><Link className="button" to={targetPath(course)}>Continue Learning</Link><button disabled={unenroll.isPending} onClick={() => remove(course)} type="button">{unenroll.isPending ? 'Unenrolling…' : 'Unenroll'}</button></article>)}</div> : <EmptyState title="You have no courses yet"><Link className="button" to="/al-ict">Explore courses</Link></EmptyState>}</section>;
};

export const LearningHistoryPage = () => {
  const history = useLearningHistory(); if (history.isLoading) return <LoadingSkeleton />; if (history.error) return <InlineError error={history.error} />;
  return <section><p className="eyebrow">Learning history</p><h1>Your recent learning</h1>{history.data.items.length ? <ol className="learning-history-list">{history.data.items.map((item) => <li key={item.id}><strong>{item.eventType.replaceAll('_', ' ')}</strong><span>{item.course?.title || 'Course'} · {formatDate(item.occurredAt)}</span></li>)}</ol> : <EmptyState title="No learning history yet" />}</section>;
};

export const StudentProfilePage = ({ completion = false }) => {
  const { user } = useAuth(); const profile = useStudentProfile(); const update = useUpdateStudentProfile(); const navigate = useNavigate(); const [search] = useSearchParams(); const form = useForm({ defaultValues: { fullName: user?.name || '', whatsAppSame: true } });
  useEffect(() => { if (profile.data) form.reset({ ...profile.data, whatsAppSame: profile.data.whatsAppNumber === profile.data.mobileNumber }); }, [form, profile.data]);
  if (profile.isLoading) return <LoadingSkeleton />;
  const submit = async (values) => { const saved = await update.mutateAsync({ ...values, whatsAppNumber: values.whatsAppSame ? values.mobileNumber : values.whatsAppNumber }); const requested = search.get('returnTo'); if (completion && saved.isComplete) navigate(requested?.startsWith('/') ? requested : '/dashboard', { replace: true }); };
  return <section className="form-card enrollment-form"><p className="eyebrow">{completion ? 'One more step' : 'My profile'}</p><h1>{completion ? 'Complete your student profile' : 'Student information'}</h1><p>Complete these details once after Google sign-in. Course enrollment will only need your confirmation.</p><p>Google email (read-only): <strong>{user?.email}</strong></p><form onSubmit={form.handleSubmit(submit)}><label>Full name<input {...form.register('fullName', { required: 'Enter your full name' })} /></label><label>Date of birth<input max={new Date().toISOString().slice(0, 10)} type="date" {...form.register('dateOfBirth', { required: 'Enter your date of birth' })} /></label><label>Address<input {...form.register('address', { required: 'Enter your address' })} /></label><label>City<input {...form.register('city', { required: 'Enter your city' })} /></label><label>Mobile number<input {...form.register('mobileNumber', { required: 'Enter your mobile number', validate: (value) => validPhone.test(value.replace(/[\s-]/g, '')) || 'Enter a valid Sri Lankan mobile number' })} /></label><label><input type="checkbox" {...form.register('whatsAppSame')} /> WhatsApp number is the same as mobile</label><label>WhatsApp number<input {...form.register('whatsAppNumber', { required: 'Enter your WhatsApp number' })} /></label><label>School name<input {...form.register('schoolName', { required: 'Enter your school name' })} /></label><label>Gender<select {...form.register('gender', { required: 'Select your gender' })}><option value="">Select</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option><option value="prefer_not_to_say">Prefer not to say</option></select></label>{Object.values(form.formState.errors).map((error) => <p className="field-error" key={error.message}>{error.message}</p>)}{update.error && <InlineError error={update.error} />}<button disabled={update.isPending} type="submit">{update.isPending ? 'Saving…' : completion ? 'Save and continue' : 'Save profile'}</button></form></section>;
};

export const CompleteProfilePage = () => <StudentProfilePage completion />;
export const EnrollmentDashboard = () => <StudentDashboard />;
