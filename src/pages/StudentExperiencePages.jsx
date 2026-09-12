import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/auth-context.jsx';
import { EmptyState, InlineError, LoadingSkeleton, StatusBadge } from '../components/common/States.jsx';
import { isProfileComplete } from '../features/student/student-learning.js';
import { safeDestination } from '../utils/route-destination.js';
import { useLearningHistory, useStudentDashboard, useStudentProfile, useUnenrollFromCourse, useUpdateStudentProfile } from '../features/student/hooks.js';

const validPhone = /^(?:\+94|0)?7\d{8}$/;
const sriLankanDistricts = ['Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'];
const formatDate = (value) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Not started';
const targetPath = (course) => course?.continueLearning ? `/courses/${course.slug}/lessons/${course.continueLearning.lessonSlug}/activities/${course.continueLearning.activityId}` : `/courses/${course?.slug}/learn`;
const courseLessonsPath = (course) => `/courses/${course?.slug}/learn`;

const CourseBookIcon = () => <svg aria-hidden="true" fill="none" focusable="false" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4.5 5.5A2.5 2.5 0 0 1 7 3h4.5v16H7a2.5 2.5 0 0 0-2.5 2.5v-16ZM19.5 5.5A2.5 2.5 0 0 0 17 3h-4.5v16H17a2.5 2.5 0 0 0-2.5 2.5v-16Z" /></svg>;

const NewLearnerWelcome = () => <section className="student-onboarding" aria-labelledby="getting-started-title">
  <div className="student-onboarding-copy">
    <p className="eyebrow">Get started</p>
    <h2 id="getting-started-title">මට දැන් ict හරි ලේසියි</h2>
    <p>Start Your First Free Lesson Now.</p>
    <nav aria-label="Select your ICT learning path" className="student-path-actions">
      <Link className="button" to="/school-ict"><strong>School ICT</strong><span>Grades 6–9</span></Link>
      <Link className="button" to="/ol-ict"><strong>G.C.E. O/L ICT</strong><span>Grades 10–11</span></Link>
      <Link className="button" to="/al-ict"><strong>G.C.E. A/L ICT</strong><span>Grades 12–13</span></Link>
    </nav>
  </div>
  <img alt="Student learning with a headset" className="student-onboarding-image" src="/images/learning-places/lh-collection-headset-highschool-student-classroom.webp" />
</section>;

const DashboardActivityCard = ({ title, children }) => <article className="dashboard-activity-card"><h3>{title}</h3>{children}</article>;

export const ProfileCompletionGuard = ({ children }) => {
  const { user, isRestoringSession } = useAuth(); const profile = useStudentProfile(); const location = useLocation();
  if (isRestoringSession || profile.isLoading) return <LoadingSkeleton label="Checking your student profile" />;
  if (!user || !(user.roles || [user.role]).includes('student')) return children || <Outlet />;
  if (location.pathname === '/complete-profile' || location.pathname === '/profile') return children || <Outlet />;
  return isProfileComplete(profile.data) ? children || <Outlet /> : <Navigate replace to={`/complete-profile?returnTo=${encodeURIComponent(location.pathname)}`} />;
};

const LearningCourseCard = ({ course, isUnenrolling = false, onUnenroll }) => {
  const progress = course.progress || {};
  const completed = progress.completedCount || 0;
  const required = progress.requiredCount || 0;
  const percentage = progress.percentage || 0;
  const level = course.academicLevel || 'ICT';
  const medium = course.medium ? `${course.medium} medium` : 'Selected medium';
  const remaining = Math.max(required - completed, 0);

  return <article className="learning-course-card">
    <header className="learning-course-card-header">
      <span aria-hidden="true" className="learning-course-icon"><CourseBookIcon /></span>
      <div><p>{level}</p><span>{medium}</span></div>
      <StatusBadge status={course.status} />
    </header>
    <h3>{course.title}</h3>
    <div className="learning-course-progress">
      <div><span>Course progress</span><strong>{percentage}%</strong></div>
      <progress aria-label={`${course.title} progress`} max="100" value={percentage} />
      <p>{completed} of {required} required activities complete</p>
    </div>
    <p className="learning-course-mission"><span>Your next mission</span><strong>{required ? remaining ? `${remaining} activit${remaining === 1 ? 'y' : 'ies'} left in this course journey` : 'Course goal complete — revisit any lesson anytime' : 'Choose any available lesson to begin'}</strong></p>
    <div className="learning-course-last"><span>Last learning</span><strong>{formatDate(course.lastLearningAt)}</strong></div>
    <div className="learning-course-actions"><Link className="button" to={courseLessonsPath(course)}>View lessons</Link>{onUnenroll ? <button disabled={isUnenrolling} onClick={() => onUnenroll(course)} type="button">{isUnenrolling ? 'Unenrolling…' : 'Unenroll'}</button> : null}</div>
  </article>;
};

export const StudentDashboard = () => {
  const { user } = useAuth(); const data = useStudentDashboard();
  if (data.isLoading) return <LoadingSkeleton />;
  if (data.error) return <InlineError error={data.error} />;
  const dashboard = data.data; const continuation = dashboard.continueLearning;
  const hasCourses = dashboard.courses.length > 0;
  const activeCourse = dashboard.courses.find((course) => course.courseTrackId === continuation?.courseTrackId || course.slug === continuation?.slug);
  const progress = activeCourse?.progress || continuation?.progress || {};
  const completed = progress.completedCount || 0;
  const required = progress.requiredCount || 0;
  const percentage = progress.percentage || 0;
  return <section className="member-dashboard"><header className="student-dashboard-heading"><p className="eyebrow">My ICT learning</p><h1>Hi, {user?.name || 'student'}!</h1><p>{hasCourses ? 'Here is what is waiting for you today.' : 'Your lessons, progress and results — all in one place.'}</p></header>
    {continuation ? <article className="student-dashboard-feature"><div className="student-dashboard-feature-copy"><p className="eyebrow">Continue learning</p><h2>{continuation.title}</h2><p>{continuation.continueLearning?.title || 'Choose your next activity and keep your learning journey moving.'}</p></div>{required ? <div className="student-dashboard-mission"><div><span>Course journey</span><strong>{percentage}%</strong></div><progress aria-label={`${continuation.title} progress`} max="100" value={percentage} /><p>{completed} of {required} activities complete · choose any available activity next</p></div> : null}<Link className="button" to={targetPath(continuation)}>Continue learning <span aria-hidden="true">→</span></Link></article> : hasCourses ? <article className="student-dashboard-ready"><p><strong>Ready to begin?</strong> Open a course below to view its lessons.</p></article> : <NewLearnerWelcome />}
    {hasCourses ? <section><div className="member-section-heading"><div><p className="eyebrow">Your courses</p><h2>Pick up where you left off</h2></div><Link to="/my-courses">View all courses <span aria-hidden="true">→</span></Link></div><div className="student-course-grid">{dashboard.courses.slice(0, 3).map((course) => <LearningCourseCard course={course} key={course.enrolmentId} />)}</div></section> : null}
    {hasCourses ? <section className="dashboard-activity-section" aria-labelledby="learning-activity-title"><div className="member-section-heading"><h2 id="learning-activity-title">Your activity</h2></div><div className="student-dashboard-grid">
      <DashboardActivityCard title="Quiz results">{dashboard.recentQuizResults.length ? dashboard.recentQuizResults.map((item) => <p key={`${item.courseTrackId}-${item.quizId}`}><strong>{item.courseTitle}</strong><br />{item.title} · {item.percentage}%</p>) : <p>Your quiz results will appear here.</p>}</DashboardActivityCard>
      <DashboardActivityCard title="Grades">{dashboard.pendingGrades.length ? dashboard.pendingGrades.map((item) => <p key={`${item.courseTrackId}-${item.quizId}`}><strong>{item.courseTitle}</strong><br />{item.title} is ready to review.</p>) : <p>No grades are waiting.</p>}</DashboardActivityCard>
      <DashboardActivityCard title="Recent learning">{dashboard.recentLearning.length ? dashboard.recentLearning.slice(0, 4).map((item) => <p key={item.id}>{item.eventType.replaceAll('_', ' ')} <small>{formatDate(item.occurredAt)}</small></p>) : <p>Your lesson activity will appear here.</p>}</DashboardActivityCard>
    </div></section> : null}
  </section>;
};

export const MyCoursesPage = () => {
  const courses = useStudentDashboard(); const unenroll = useUnenrollFromCourse();
  if (courses.isLoading) return <LoadingSkeleton />; if (courses.error) return <InlineError error={courses.error} />;
  const remove = (course) => { if (window.confirm(`Unenroll from ${course.title}? Your progress will be kept if you enroll again later.`)) unenroll.mutate(course.courseTrackId); };
  return <section className="my-courses-page"><header className="my-courses-heading"><p className="eyebrow">My courses</p><h1>Continue your learning</h1><p>Pick up where you left off, see your progress, and keep every course within reach.</p></header>{unenroll.error && <InlineError error={unenroll.error} />}{courses.data.courses.length ? <div className="student-course-grid">{courses.data.courses.map((course) => <LearningCourseCard course={course} isUnenrolling={unenroll.isPending} key={course.enrolmentId} onUnenroll={remove} />)}</div> : <EmptyState title="You have no courses yet"><Link className="button" to="/al-ict">Explore courses</Link></EmptyState>}</section>;
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
