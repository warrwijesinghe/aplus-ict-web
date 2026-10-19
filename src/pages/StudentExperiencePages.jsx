import { useEffect } from 'react';
import { LessonEnrollmentCard } from '../components/learning/LessonEnrollmentCard.jsx';
import { LessonProgress } from '../components/learning/LessonProgress.jsx';
import { useLessonPresentation } from '../features/student/lesson-presentation.js';
import { useForm } from 'react-hook-form';
import { Link, Navigate, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/auth-context.jsx';
import { hasRole } from '../auth/authorization.js';
import { EmptyState, InlineError, LoadingSkeleton, StatusBadge } from '../components/common/States.jsx';
import { isProfileComplete } from '../features/student/student-learning.js';
import { safeDestination } from '../utils/route-destination.js';
import { useLearningHistory, useStudentDashboard, useStudentProfile, useLessonEnrollments, useUpdateStudentProfile } from '../features/student/hooks.js';
import { usePageSeo } from '../seo/use-page-seo.js';

const validPhone = /^(?:\+94|0)?7\d{8}$/;
const sriLankanDistricts = ['Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'];
const formatDate = (value) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Not started';
const targetPath = (course) => course?.continueLearning?.lessonSlug && course.continueLearning.activityId ? `/courses/${course.slug}/lessons/${course.continueLearning.lessonSlug}/activities/${course.continueLearning.activityId}` : '/my-courses';

export const ProfileCompletionGuard = ({ children }) => {
  const { user, isRestoringSession } = useAuth(); const isStudent = hasRole(user, 'student'); const profile = useStudentProfile(isStudent); const location = useLocation();
  if (isRestoringSession || profile.isLoading) return <LoadingSkeleton label="Checking your student profile" />;
  if (!user || !isStudent) return children || <Outlet />;
  if (profile.isError) return <InlineError error={profile.error} onRetry={profile.refetch} />;
  if (location.pathname === '/complete-profile' || location.pathname === '/profile') return children || <Outlet />;
  return isProfileComplete(profile.data) ? children || <Outlet /> : <Navigate replace to={`/complete-profile?returnTo=${encodeURIComponent(location.pathname + location.search)}`} />;
};

const LessonEmptyState = () => <div className="minimal-learning-empty"><h2>Ready to start?</h2><p>Start learning ICT with a free lesson.</p><Link className="button" to="/courses">Explore lessons</Link></div>;

export const StudentDashboard = () => {
  const { user } = useAuth();
  const data = useStudentDashboard();
  const enrollments = useLessonEnrollments();
  const lessons = useLessonPresentation((enrollments.data || []).slice(0, 3));
  usePageSeo({ path: '/dashboard', title: 'My Learning', noIndex: true });
  if (data.isLoading || enrollments.isLoading) return <LoadingSkeleton />;
  if (data.error) return <InlineError error={data.error} onRetry={data.refetch} />;
  if (enrollments.error) return <InlineError error={enrollments.error} onRetry={enrollments.refetch} />;
  const continuation = data.data?.continueLearning;
  const course = data.data?.courses?.find((item) => item.courseTrackId === continuation?.courseTrackId) || continuation;
  const firstName = user?.name?.trim().split(/\s+/)[0] || 'student';
  return <section className="member-dashboard minimal-learning-page">
    <header className="student-dashboard-heading"><p className="eyebrow">My ICT learning</p><h1>Hi, {firstName}</h1><p>Continue where you left off.</p></header>
    {continuation?.continueLearning?.activityId && <article className="minimal-continue-card" aria-label="Continue learning">
      <div><p className="eyebrow">Continue learning</p><h2>{continuation.title}</h2><p>{continuation.continueLearning.title}</p>{course?.lastLearningAt && <small>Last studied: {formatDate(course.lastLearningAt)}</small>}</div>
      <div className="minimal-continue-action"><LessonProgress progress={course?.progress} label={`${continuation.title} progress`} /><Link className="button" to={targetPath(continuation)}>Continue learning →</Link></div>
    </article>}
    {lessons.length ? <section aria-labelledby="dashboard-lessons-title"><div className="member-section-heading"><div><p className="eyebrow">My lessons</p><h2 id="dashboard-lessons-title">Your enrolled lessons</h2></div><Link to="/my-courses">View all →</Link></div><div className="student-course-grid">{lessons.map((enrollment) => <LessonEnrollmentCard enrollment={enrollment} key={enrollment.id} compact />)}</div></section> : <LessonEmptyState />}
    {/* TODO: Show a tutorial delivery notice when the existing order API exposes
        an actual fulfilment status. Payment status does not imply dispatch. */}
  </section>;
};

export const MyCoursesPage = () => {
  const enrollments = useLessonEnrollments();
  const lessons = useLessonPresentation(enrollments.data || []);
  usePageSeo({ path: '/my-courses', title: 'My lessons', noIndex: true });
  if (enrollments.isLoading) return <LoadingSkeleton label="Loading your lessons" />;
  if (enrollments.error) return <InlineError error={enrollments.error} onRetry={enrollments.refetch} />;
  return <section className="my-courses-page minimal-learning-page"><header className="my-courses-heading"><p className="eyebrow">My lessons</p><h1>All enrolled lessons</h1><p>Open any lesson to continue studying or revise again.</p></header>{lessons.length ? <div className="student-course-grid">{lessons.map((enrollment) => <LessonEnrollmentCard enrollment={enrollment} key={enrollment.id} />)}</div> : <LessonEmptyState />}</section>;
};
export const LearningHistoryPage = () => {
  const history = useLearningHistory(); if (history.isLoading) return <LoadingSkeleton />; if (history.error) return <InlineError error={history.error} />;
  return <section><p className="eyebrow">Learning history</p><h1>Your recent learning</h1>{history.data.items.length ? <ol className="learning-history-list">{history.data.items.map((item) => <li key={item.id}><strong>{item.eventType.replaceAll('_', ' ')}</strong><span>{item.course?.title || 'Course'} · {formatDate(item.occurredAt)}</span></li>)}</ol> : <EmptyState title="No learning history yet" />}</section>;
};

const FieldError = ({ error, id }) => error ? <span className="field-error" id={id}>{error.message}</span> : null;

export const StudentProfilePage = ({ completion = false }) => {
  const { user } = useAuth();
  const profile = useStudentProfile();
  const update = useUpdateStudentProfile();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const form = useForm({ defaultValues: { fullName: user?.name || '', preferredMedium: 'sinhala' } });
  const { errors } = form.formState;

  useEffect(() => {
    if (profile.data) form.reset({
      ...profile.data,
      district: sriLankanDistricts.includes(profile.data.district) ? profile.data.district : '',
      whatsAppNumber: profile.data.whatsAppNumber || '',
      preferredMedium: profile.data.preferredMedium || 'sinhala'
    });
  }, [form, profile.data]);

  if (profile.isLoading) return <LoadingSkeleton />;

  const submit = async (values) => {
    const saved = await update.mutateAsync(values);
    const requested = search.get('returnTo');
    if (completion && saved.isComplete) navigate(safeDestination(requested, '/dashboard'), { replace: true });
  };

  return <section className="student-profile-page">
    <div className="student-profile-shell">
      <header className="student-profile-intro">
        <p className="eyebrow">{completion ? 'Almost there' : 'My profile'}</p>
        <h1>{completion ? 'Complete your student profile' : 'Student information'}</h1>
        <p>Keep your details up to date so we can support your learning and make enrollment quick.</p>
        <div className="profile-account" aria-label="Signed-in account"><span aria-hidden="true">✓</span><div><small>Sign-in phone number</small><strong>{user?.phoneNumber || user?.email}</strong></div></div>
      </header>
      <div className="student-profile-card">
        <div className="profile-card-heading"><div><h2>Your details</h2><p>Fields marked with <span aria-hidden="true">*</span><span className="sr-only">an asterisk</span> are required.</p></div>{completion ? <span className="profile-step">Step 1 of 1</span> : null}</div>
        <form noValidate onSubmit={form.handleSubmit(submit)}>
          <fieldset><legend>Personal details</legend><div className="profile-form-grid">
            <label className="profile-field profile-field-wide" htmlFor="fullName">Full name <span aria-hidden="true">*</span><input aria-describedby={errors.fullName ? 'fullName-error' : undefined} aria-invalid={Boolean(errors.fullName)} autoComplete="name" id="fullName" {...form.register('fullName', { required: 'Enter your full name' })} /><FieldError error={errors.fullName} id="fullName-error" /></label>
            <label className="profile-field" htmlFor="dateOfBirth">Date of birth <span aria-hidden="true">*</span><input aria-describedby={errors.dateOfBirth ? 'dateOfBirth-error' : undefined} aria-invalid={Boolean(errors.dateOfBirth)} autoComplete="bday" id="dateOfBirth" max={new Date().toISOString().slice(0, 10)} type="date" {...form.register('dateOfBirth', { required: 'Enter your date of birth' })} /><FieldError error={errors.dateOfBirth} id="dateOfBirth-error" /></label>
            <label className="profile-field" htmlFor="gender">Gender <span aria-hidden="true">*</span><select aria-describedby={errors.gender ? 'gender-error' : undefined} aria-invalid={Boolean(errors.gender)} autoComplete="sex" id="gender" {...form.register('gender', { required: 'Select your gender' })}><option value="">Select an option</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option><option value="prefer_not_to_say">Prefer not to say</option></select><FieldError error={errors.gender} id="gender-error" /></label>
          </div></fieldset>
          <fieldset><legend>Contact and school</legend><div className="profile-form-grid">
            <label className="profile-field" htmlFor="email">Contact email<input id="email" type="email" autoComplete="email" maxLength={254} {...form.register('email')} /><span className="field-hint">Required for card checkout and receipts. Your sign-in phone number is shown above.</span></label>
            <label className="profile-field profile-field-wide" htmlFor="address">Address <span aria-hidden="true">*</span><input aria-describedby={errors.address ? 'address-error' : undefined} aria-invalid={Boolean(errors.address)} autoComplete="street-address" id="address" {...form.register('address', { required: 'Enter your address' })} /><FieldError error={errors.address} id="address-error" /></label>
            <label className="profile-field" htmlFor="city">City <span aria-hidden="true">*</span><input aria-describedby={errors.city ? 'city-error' : undefined} aria-invalid={Boolean(errors.city)} autoComplete="address-level2" id="city" {...form.register('city', { required: 'Enter your city' })} /><FieldError error={errors.city} id="city-error" /></label>
            <label className="profile-field" htmlFor="district">District <span aria-hidden="true">*</span><select aria-describedby={errors.district ? 'district-error' : undefined} aria-invalid={Boolean(errors.district)} autoComplete="address-level1" id="district" {...form.register('district', { required: 'Select your district' })}><option value="">Select your district</option>{sriLankanDistricts.map((district) => <option key={district} value={district}>{district}</option>)}</select><FieldError error={errors.district} id="district-error" /></label>
            <label className="profile-field" htmlFor="schoolName">School name <span aria-hidden="true">*</span><input aria-describedby={errors.schoolName ? 'schoolName-error' : undefined} aria-invalid={Boolean(errors.schoolName)} id="schoolName" {...form.register('schoolName', { required: 'Enter your school name' })} /><FieldError error={errors.schoolName} id="schoolName-error" /></label>
            <label className="profile-field" htmlFor="mobileNumber">Mobile number <span aria-hidden="true">*</span><input aria-describedby={errors.mobileNumber ? 'mobileNumber-error' : 'mobileNumber-help'} aria-invalid={Boolean(errors.mobileNumber)} autoComplete="tel" id="mobileNumber" inputMode="tel" placeholder="077 123 4567" {...form.register('mobileNumber', { required: 'Enter your mobile number', validate: (value) => validPhone.test(value.replace(/[\s-]/g, '')) || 'Enter a valid Sri Lankan mobile number' })} />{errors.mobileNumber ? <FieldError error={errors.mobileNumber} id="mobileNumber-error" /> : <span className="field-hint" id="mobileNumber-help">Use a Sri Lankan mobile number.</span>}</label>
            <label className="profile-field" htmlFor="whatsAppNumber">WhatsApp number <span aria-hidden="true">*</span><input aria-describedby={errors.whatsAppNumber ? 'whatsAppNumber-error' : 'whatsAppNumber-help'} aria-invalid={Boolean(errors.whatsAppNumber)} autoComplete="tel" id="whatsAppNumber" inputMode="tel" placeholder="077 123 4567" {...form.register('whatsAppNumber', { validate: (value) => validPhone.test(value.replace(/[\s-]/g, '')) || 'Enter a valid Sri Lankan WhatsApp number' })} />{errors.whatsAppNumber ? <FieldError error={errors.whatsAppNumber} id="whatsAppNumber-error" /> : <span className="field-hint" id="whatsAppNumber-help">Enter the number you use for WhatsApp.</span>}</label>
            <label className="profile-field" htmlFor="preferredMedium">Preferred communication language<select aria-describedby="preferredMedium-help" id="preferredMedium" {...form.register('preferredMedium')}><option value="sinhala">Sinhala</option><option value="english">English</option></select><span className="field-hint" id="preferredMedium-help">Used for messages and support updates. You can still enroll in Sinhala or English medium courses.</span></label>
          </div></fieldset>
          {update.error ? <InlineError error={update.error} /> : null}
          <div className="profile-form-actions"><p>Your information is used only to manage your student account.</p><button className="button" disabled={update.isPending} type="submit">{update.isPending ? 'Saving…' : completion ? 'Save and continue' : 'Save profile'}</button></div>
        </form>
      </div>
    </div>
  </section>;
};

export const CompleteProfilePage = () => <StudentProfilePage completion />;
export const EnrollmentDashboard = () => <StudentDashboard />;
