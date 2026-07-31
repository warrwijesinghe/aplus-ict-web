import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { contentApi } from '../api/content.api.js';
import { queryKeys } from '../api/query-keys.js';
import { useAuth } from '../auth/auth-context.jsx';
import { InlineError, LoadingSkeleton } from '../components/common/States.jsx';
import { useEnrollInCourse, useStudentProfile, useUpdateStudentProfile } from '../features/student/hooks.js';
import { isProfileComplete } from '../features/student/student-learning.js';

const validPhone = /^(?:\+94|0)?7\d{8}$/;
export const EnrollmentPage = () => {
  const { courseSlug } = useParams(); const { isAuthenticated, user, startGoogleLogin } = useAuth(); const location = useLocation(); const navigate = useNavigate();
  const courseQuery = useQuery({ queryKey: queryKeys.content.publicCourse(courseSlug), queryFn: ({ signal }) => contentApi.publicCourse(courseSlug, signal) });
  const profile = useStudentProfile(); const saveProfile = useUpdateStudentProfile(); const enroll = useEnrollInCourse();
  const form = useForm({ defaultValues: { fullName: user?.name || '', whatsAppSame: true, preferredMedium: '' } });
  useEffect(() => { if (profile.data) form.reset({ ...profile.data, whatsAppSame: profile.data.whatsAppNumber === profile.data.mobileNumber }); }, [form, profile.data]);
  if (courseQuery.isLoading || (isAuthenticated && profile.isLoading)) return <LoadingSkeleton />;
  if (courseQuery.isError) return <InlineError error={courseQuery.error} />;
  const course = courseQuery.data?.data;
  if (!isAuthenticated) return <section className="form-card"><h1>Login to enroll</h1><p>Google sign-in creates your account; enrollment is a separate free step.</p><button onClick={() => { sessionStorage.setItem('aplus-return-to', location.pathname); startGoogleLogin(); }} type="button">Continue with Google</button></section>;
  const submit = async (values) => { const prepared = { ...values, whatsAppNumber: values.whatsAppSame ? values.mobileNumber : values.whatsAppNumber, googleEmail: user?.email }; if (!isProfileComplete(prepared)) return; await saveProfile.mutateAsync(prepared); await enroll.mutateAsync(course); navigate(`/courses/${course.slug}/learn`, { state: { enrolled: true }, replace: true }); };
  const existing = isProfileComplete(profile.data);
  return <section className="form-card enrollment-form"><p className="eyebrow">Free course enrollment</p><h1>{course.title}</h1><p><strong>Medium:</strong> {course.medium?.name || course.medium?.code} · <strong>Fee:</strong> Free</p><p>Google email: <strong>{user?.email}</strong></p><form onSubmit={form.handleSubmit(submit)}>
    {!existing ? <><label>Full name<input {...form.register('fullName', { required: true })} /></label><label>Mobile number<input {...form.register('mobileNumber', { required: true, validate: (v) => validPhone.test(v.replace(/[\s-]/g, '')) })} /></label><label><input type="checkbox" {...form.register('whatsAppSame')} /> WhatsApp number is the same as mobile</label><label>WhatsApp number<input {...form.register('whatsAppNumber')} /></label><label>A/L examination year<input type="number" {...form.register('examYear', { required: true })} /></label><label>School name<input {...form.register('schoolName', { required: true })} /></label><label>District<input {...form.register('district', { required: true })} /></label><label>Preferred medium<select {...form.register('preferredMedium', { required: true })}><option value="">Select</option><option value="sinhala">Sinhala Medium</option><option value="english">English Medium</option></select></label><label>Town (optional)<input {...form.register('town')} /></label><label>Parent or guardian contact (optional)<input {...form.register('guardianContactNumber')} /></label><label>How did you hear about us? (optional)<input {...form.register('referralSource')} /></label></> : <><p>Your saved profile will be used for this enrollment.</p><Link to="/student/profile">Update My Information</Link></>}
    {(saveProfile.error || enroll.error) && <InlineError error={saveProfile.error || enroll.error} />}<button disabled={saveProfile.isPending || enroll.isPending} type="submit">{saveProfile.isPending || enroll.isPending ? 'Confirming…' : existing ? 'Confirm Enrollment' : 'Confirm Free Enrollment'}</button>
  </form></section>;
};
