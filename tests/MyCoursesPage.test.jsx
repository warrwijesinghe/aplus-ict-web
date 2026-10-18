import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import { MyCoursesPage } from '../src/pages/StudentExperiencePages.jsx';

const hooks = vi.hoisted(() => ({ useStudentDashboard: vi.fn(), useUnenrollFromCourse: vi.fn() }));
vi.mock('../src/features/student/hooks.js', () => ({ ...hooks }));
const show = () => render(<MemoryRouter><MyCoursesPage /></MemoryRouter>);

beforeEach(() => {
  hooks.useStudentDashboard.mockReturnValue({ data: { courses: [] }, isLoading: false });
  hooks.useUnenrollFromCourse.mockReturnValue({ mutate: vi.fn(), isPending: false });
});

it('takes students without enrollments to the full category selector', () => {
  show();
  expect(screen.getByText('Choose a category and enroll in a course to see it here.')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Explore courses' })).toHaveAttribute('href', '/student/explore');
});

it('offers resume, lessons and the category selector for enrolled courses', () => {
  hooks.useStudentDashboard.mockReturnValue({ data: { courses: [{ enrolmentId: 'enrolment', courseTrackId: 'track', slug: 'ict', title: 'ICT', status: 'active', medium: 'English', progress: { completedCount: 1, requiredCount: 2, percentage: 50 }, continueLearning: { lessonSlug: 'lesson', activityId: 'activity' } }] } });
  show();
  expect(screen.getByRole('link', { name: 'Continue learning' })).toHaveAttribute('href', '/courses/ict/lessons/lesson/activities/activity');
  expect(screen.getByRole('link', { name: 'View lessons' })).toHaveAttribute('href', '/courses/ict/learn');
  expect(screen.getByRole('link', { name: 'Explore more courses' })).toHaveAttribute('href', '/student/explore');
});

it('explains unavailable enrollments without linking to inaccessible lessons', () => {
  hooks.useStudentDashboard.mockReturnValue({ data: { courses: [{ enrolmentId: 'enrolment', courseTrackId: 'track', slug: 'ict', title: 'ICT', status: 'active', availabilityStatus: 'unavailable' }] } });
  show();
  const card = screen.getByRole('heading', { name: 'ICT' }).closest('article');
  expect(within(card).getByText(/currently unavailable/)).toBeInTheDocument();
  expect(within(card).queryByRole('link')).not.toBeInTheDocument();
  expect(within(card).getByRole('button', { name: 'Unenroll' })).toBeInTheDocument();
});
