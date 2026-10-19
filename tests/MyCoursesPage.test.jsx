import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import { MyCoursesPage } from '../src/pages/StudentExperiencePages.jsx';

const hooks = vi.hoisted(() => ({ useLessonEnrollments: vi.fn() }));
vi.mock('../src/features/student/hooks.js', () => ({ ...hooks }));
vi.mock('../src/features/student/lesson-presentation.js', () => ({ useLessonPresentation: (items) => items }));
const show = () => render(<MemoryRouter><MyCoursesPage /></MemoryRouter>);
const enrollment = { id: 'enrolment', lessonId: 'lesson', courseTitle: 'Grade 6 ICT', courseSlug: 'grade-6', lessonTitle: 'Importance of Computers', lessonSlug: 'computers', lessonNumber: 1, medium: 'English', enrolledAt: '2026-10-19T06:30:00Z', expiresAt: '2028-10-19T06:30:00Z', status: 'active', availabilityStatus: 'active', canLearn: true, fullAccess: false, started: true, progress: { progressPercent: 40 } };
beforeEach(() => hooks.useLessonEnrollments.mockReturnValue({ data: [], isLoading: false }));

it('takes students without lesson enrollments to the public courses page', () => {
  show();
  expect(screen.getByText('Ready to start?')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Explore lessons' })).toHaveAttribute('href', '/courses');
});

it('shows the selected lesson, real progress and study and unlock actions', () => {
  hooks.useLessonEnrollments.mockReturnValue({ data: [enrollment] });
  show();
  const card = screen.getByRole('heading', { name: /Importance of Computers/ }).closest('article');
  expect(within(card).getByText('Grade 6 ICT')).toBeInTheDocument();
  expect(within(card).getByText('40% complete')).toBeInTheDocument();
  expect(card.querySelector('time')).toBeNull();
  expect(within(card).getByRole('link', { name: 'Continue learning' })).toHaveAttribute('href', '/courses/grade-6/lessons/computers/learn');
  expect(within(card).getByRole('link', { name: 'Unlock Full Lesson' })).toHaveAttribute('href', '/courses/grade-6/lessons/computers/exam-success-pack');
  expect(within(card).getAllByRole('link')).toHaveLength(2);
});

it('keeps unavailable lessons from exposing learning actions', () => {
  hooks.useLessonEnrollments.mockReturnValue({ data: [{ ...enrollment, status: 'revoked', canLearn: false }] });
  show();
  expect(screen.getByText('Unavailable')).toBeInTheDocument();
  expect(screen.getByText(/currently unavailable/)).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Continue learning' })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'View access details' })).toHaveAttribute('href', '/courses/grade-6/lessons/computers');
});
