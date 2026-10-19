import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, test, vi } from 'vitest';
import { StudentLayout } from '../src/layouts/StudentLayout.jsx';
import { StudentDashboard } from '../src/pages/StudentExperiencePages.jsx';
import { LessonEnrollmentCard } from '../src/components/learning/LessonEnrollmentCard.jsx';

vi.mock('../src/auth/auth-context.jsx', () => ({ useAuth: () => ({ user: { name: 'Student Example', roles: ['student'] } }) }));
vi.mock('../src/features/student/hooks.js', () => ({
  useStudentDashboard: () => ({ data: { continueLearning: { courseTrackId: 'track', slug: 'grade-11', title: 'Grade 11 ICT', continueLearning: { activityId: 'activity', lessonSlug: 'problem-solving', title: 'Worked example' }, progress: { percentage: 50 }, lastLearningAt: '2026-10-19T06:30:00Z' }, courses: [] } }),
  useLessonEnrollments: () => ({ data: [{ id: 'enrolment', lessonId: 'lesson', courseTitle: 'Grade 11 ICT', courseSlug: 'grade-11', lessonSlug: 'problem-solving', lessonTitle: 'Problem solving', canLearn: true, status: 'active', progress: { progressPercent: 35 }, started: true, fullAccess: false }] }),
  useStudentProfile: vi.fn(), useLearningHistory: vi.fn(), useUpdateStudentProfile: vi.fn(),
}));
vi.mock('../src/features/student/lesson-presentation.js', () => ({ useLessonPresentation: (items) => items }));

test('sidebar and mobile navigation retain only the requested primary destinations', () => {
  render(<MemoryRouter initialEntries={['/dashboard']}><StudentLayout /></MemoryRouter>);
  const sidebar = screen.getByRole('navigation', { name: 'Student navigation' });
  expect(within(sidebar).getAllByRole('link').map((link) => [link.textContent, link.getAttribute('href')])).toEqual([['My Learning', '/dashboard'], ['My orders', '/my-orders'], ['Profile', '/profile']]);
  const mobile = screen.getByRole('navigation', { name: 'Mobile learning navigation' });
  expect(within(mobile).getAllByRole('link')).toHaveLength(3);
  expect(within(mobile).getByRole('link', { name: 'Lessons' })).toHaveAttribute('href', '/my-courses');
  expect(screen.getAllByRole('link', { name: 'Log out' }).every((link) => link.getAttribute('href') === '/logout')).toBe(true);
});

test('dashboard keeps real resume information and one minimal enrolled-lesson section', () => {
  render(<MemoryRouter><StudentDashboard /></MemoryRouter>);
  expect(screen.getByRole('heading', { name: 'Hi, Student' })).toBeInTheDocument();
  expect(screen.getByText('Worked example')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Continue learning →' })).toHaveAttribute('href', '/courses/grade-11/lessons/problem-solving/activities/activity');
  expect(screen.getByRole('link', { name: 'View all →' })).toHaveAttribute('href', '/my-courses');
  expect(screen.getByText('35% complete')).toBeInTheDocument();
  expect(screen.queryByText('Your activity')).not.toBeInTheDocument();
  expect(screen.queryByText('Enrolled on')).not.toBeInTheDocument();
});

test.each([{ percentage: 0, started: false, action: 'Continue' }, { percentage: 65, started: true, action: 'Continue' }, { percentage: 100, started: true, action: 'Study again' }])('lesson action reflects actual progress: $action', ({ percentage, started, action }) => {
  render(<MemoryRouter><LessonEnrollmentCard enrollment={{ courseSlug: 'ict', lessonSlug: 'one', lessonTitle: 'තොරතුරු තාක්ෂණය', canLearn: true, status: 'active', fullAccess: true, progress: { progressPercent: percentage, isCompleted: percentage === 100 }, started }} /></MemoryRouter>);
  expect(screen.getByRole('link', { name: action })).toBeInTheDocument();
  expect(screen.getByText('Full access')).toBeInTheDocument();
  expect(screen.getAllByRole('link')).toHaveLength(1);
});
