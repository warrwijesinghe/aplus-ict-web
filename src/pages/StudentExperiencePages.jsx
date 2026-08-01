import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { contentApi } from '../api/content.api.js';
import { queryKeys } from '../api/query-keys.js';
import { useAuth } from '../auth/auth-context.jsx';
import { EmptyState, InlineError, LoadingSkeleton } from '../components/common/States.jsx';
import { useStudentEnrollments, useStudentProfile, useUpdateStudentProfile } from '../features/student/hooks.js';

export const EnrollmentDashboard = () => {
  const { user } = useAuth(); const enrollments = useStudentEnrollments();
  const courses = useQuery({ queryKey: queryKeys.content.publicCourses, queryFn: ({ signal }) => contentApi.publicCourses(signal) });
  if (enrollments.isLoading || courses.isLoading) return <LoadingSkeleton />;
  if (enrollments.isError || courses.isError) return <InlineError error={enrollments.error || courses.error} />;
  const catalogue = courses.data?.data || []; const mine = enrollments.data || []; const enrolled = mine.map((entry) => ({ entry, course: catalogue.find((course) => course.id === entry.courseId) })).filter((item) => item.course);
  return <section className="member-dashboard"><p className="eyebrow">My learning</p><h1>Welcome back, {user?.name || 'student'}.</h1>
    {!enrolled.length ? <EmptyState title="You have not enrolled in a course yet"><Link className="button" to="/al-ict">Explore Grades 12–13 ICT</Link></EmptyState> : <><h2>My Courses</h2><div className="member-action-grid">{enrolled.map(({ entry, course }) => <Link key={entry.id} to={`/courses/${course.slug}/learn`}><span>ACTIVE</span><strong>{course.title}</strong><small>Enrollment active · Continue free learning</small></Link>)}</div><h2>Continue Learning</h2><p>Open an enrolled course to continue from your latest accessible chapter.</p><h2>My Purchased Lessons</h2><p>No paid lesson entitlements yet.</p><h2>Recent Activity</h2><p>Recent learning activity will appear after you start a chapter.</p></>}
    <h2>Explore Courses</h2><div className="member-action-grid">{catalogue.filter((course) => !mine.some((entry) => entry.courseId === course.id)).map((course) => <Link key={course.id} to={`/enroll/${course.slug}`}><span>{course.medium?.name || course.medium?.code}</span><strong>{course.title}</strong><small>Enroll Free</small></Link>)}</div>
  </section>;
};

export const StudentProfilePage = () => {
  const { user } = useAuth(); const profile = useStudentProfile(); const update = useUpdateStudentProfile(); const form = useForm({ values: profile.data || {} });
  if (profile.isLoading) return <LoadingSkeleton />;
  return <section className="form-card enrollment-form"><p className="eyebrow">My profile</p><h1>Student information</h1><p>Google email (read-only): <strong>{user?.email}</strong></p><form onSubmit={form.handleSubmit((values) => update.mutate({ ...values, googleEmail: user?.email }))}><label>Full name<input {...form.register('fullName')} /></label><label>Mobile number<input {...form.register('mobileNumber')} /></label><label>WhatsApp number<input {...form.register('whatsAppNumber')} /></label><label>A/L examination year<input type="number" {...form.register('examYear')} /></label><label>School name<input {...form.register('schoolName')} /></label><label>District<input {...form.register('district')} /></label><label>Town<input {...form.register('town')} /></label><label>Parent or guardian contact<input {...form.register('guardianContactNumber')} /></label><label>Preferred medium<select {...form.register('preferredMedium')}><option value="">Select</option><option value="sinhala">Sinhala Medium</option><option value="english">English Medium</option></select></label>{update.error && <InlineError error={update.error} />}<button disabled={update.isPending} type="submit">{update.isPending ? 'Saving…' : 'Save profile'}</button></form></section>;
};
