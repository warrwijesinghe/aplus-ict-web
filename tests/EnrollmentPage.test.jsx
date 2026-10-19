import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, expect, test, vi } from 'vitest';

const state = vi.hoisted(() => ({ auth: {}, profile: {}, enroll: vi.fn(), useProfile: vi.fn() }));
vi.mock('../src/auth/auth-context.jsx', () => ({ useAuth: () => state.auth }));
vi.mock('@tanstack/react-query', () => ({ useQuery: () => ({ data: { data: { id: 'course', slug: 'al-ict-sinhala', title: 'A/L ICT' } } }) }));
vi.mock('../src/features/student/hooks.js', () => ({
  useStudentProfile: (enabled) => { state.useProfile(enabled); return state.profile; },
  useEnrollInCourse: () => ({ mutateAsync: state.enroll }),
  useLearningHistory: vi.fn(), useStudentDashboard: vi.fn(), useUnenrollFromCourse: vi.fn(), useUpdateStudentProfile: vi.fn(),
}));
import { EnrollmentPage } from '../src/pages/EnrollmentPage.jsx';
import { ProfileCompletionGuard } from '../src/pages/StudentExperiencePages.jsx';

const base = '/courses/al-ict-sinhala/lessons/concept-of-ict';
const show = (destination = `${base}/learn`) => render(<MemoryRouter initialEntries={[`/enroll/al-ict-sinhala?returnTo=${encodeURIComponent(destination)}`]}><Routes>
  <Route path="/enroll/:courseSlug" element={<EnrollmentPage />} />
  <Route element={<ProfileCompletionGuard />}><Route path={`${base}/learn`} element={<p>Lesson workspace</p>} /><Route path={`${base}/exam-success-pack`} element={<p>Lesson checkout</p>} /></Route>
  <Route path="/complete-profile" element={<p>Complete student profile</p>} />
  <Route path="/login" element={<p>Phone sign in</p>} />
</Routes></MemoryRouter>);

beforeEach(() => {
  vi.clearAllMocks();
  state.auth = { isAuthenticated: true, user: { role: 'admin', roles: ['admin'] } };
  state.profile = { data: null };
  state.enroll.mockResolvedValue({});
});

test.each([{ suffix: '/learn', result: 'Lesson workspace' }, { suffix: '/exam-success-pack', result: 'Lesson checkout' }])('staff can enrol and return to the requested lesson $suffix without student onboarding', async ({ suffix, result }) => {
  show(base + suffix);
  expect(screen.getByText('Account ready')).toBeInTheDocument();
  expect(state.useProfile).toHaveBeenCalledWith(false);
  fireEvent.click(screen.getByRole('button', { name: 'Enroll Free Now' }));
  fireEvent.click(screen.getByRole('button', { name: 'Yes, enroll me' }));
  expect(await screen.findByText(result)).toBeInTheDocument();
  expect(state.enroll).toHaveBeenCalledWith(expect.objectContaining({ id: 'course', lessonSlug: 'concept-of-ict' }));
});

test('students with incomplete profiles still complete onboarding', () => {
  state.auth.user = { roles: [{ code: 'student' }] };
  show();
  expect(screen.getByText('Complete student profile')).toBeInTheDocument();
  expect(state.enroll).not.toHaveBeenCalled();
});

test('visitors must sign in before enrolling', () => {
  state.auth = { isAuthenticated: false, user: null };
  show();
  fireEvent.change(screen.getByRole('textbox', { name: 'Mobile number' }), { target: { value: '77 123 4567' } });
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  expect(screen.getByText('Phone sign in')).toBeInTheDocument();
  expect(state.enroll).not.toHaveBeenCalled();
});

test('guest enrollment identifies the course and links back to the chosen lesson', () => {
  state.auth = { isAuthenticated: false, user: null };
  show(`${base}/exam-success-pack`);
  expect(screen.getByRole('heading', { name: 'Start learning' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'A/L ICT' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Back to lesson' })).toHaveAttribute('href', base);
  fireEvent.change(screen.getByRole('textbox', { name: 'Mobile number' }), { target: { value: '12345' } });
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid Sri Lankan mobile number');
  expect(state.enroll).not.toHaveBeenCalled();
});
