import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, test } from 'vitest';
import { LessonEnrollmentCard } from '../src/components/learning/LessonEnrollmentCard.jsx';

const row = { courseTitle: 'ICT', courseSlug: 'ict', lessonSlug: 'one', lessonTitle: 'Computers', canLearn: true, status: 'active', fullAccess: false, accessUntil: null };
const show = (values) => render(<MemoryRouter><LessonEnrollmentCard enrollment={{ ...row, ...values }} /></MemoryRouter>);

test('free preview completion remains 15% of the full lesson and links to checkout', () => {
  show({ progress: { progressPercent: 15, completedActivities: 3, totalRequiredActivities: 20, freePreviewCompleted: true, isCompleted: false } });
  expect(screen.getByRole('progressbar')).toHaveAttribute('value', '15');
  expect(screen.getByText('✓ Free preview completed')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Unlock Full Lesson' })).toHaveAttribute('href', '/courses/ict/lessons/one/exam-success-pack');
  expect(screen.queryByText(/^Free$/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/Access until/)).not.toBeInTheDocument();
  expect(screen.queryByText('✓ 100% complete')).not.toBeInTheDocument();
});

test('free activities still remaining use Continue learning and show no expiry', () => {
  show({ progress: { progressPercent: 5, freePreviewCompleted: false, isCompleted: false } });
  expect(screen.getByRole('link', { name: 'Continue learning' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Unlock Full Lesson' })).toHaveAttribute('href', '/courses/ict/lessons/one/exam-success-pack');
  expect(screen.queryByText(/Access until/)).not.toBeInTheDocument();
});

test.each([{ completed: false, percent: 15, action: 'Continue' }, { completed: true, percent: 100, action: 'Study again' }])('purchased lesson uses saved paid expiry and the $action action', ({ completed, percent, action }) => {
  show({ fullAccess: true, accessUntil: '2028-10-19T09:00:00Z', progress: { progressPercent: percent, isCompleted: completed, freePreviewCompleted: true } });
  expect(screen.getByText('Access until 19 Oct 2028')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: action })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Unlock Full Lesson' })).not.toBeInTheDocument();
  expect(screen.queryByText('✓ Free preview completed')).not.toBeInTheDocument();
  if (completed) expect(screen.getByText('✓ 100% complete')).toBeInTheDocument();
});

test('a stale 100% value cannot mark free-only access as lesson completed', () => {
  show({ progress: { progressPercent: 100, isCompleted: true, freePreviewCompleted: true } });
  expect(screen.queryByText('✓ 100% complete')).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Unlock Full Lesson' })).toBeInTheDocument();
});

test.each([true, false])('an expired purchase shows its paid expiry and renews through checkout (preview completed: %s)', (freePreviewCompleted) => {
  show({ purchasedAccessExpired: true, accessUntil: '2024-01-01', progress: { progressPercent: 15, isCompleted: false, freePreviewCompleted } });
  expect(screen.queryByText(/Access until/)).not.toBeInTheDocument();
  expect(screen.getByText('Access expired 1 Jan 2024')).toHaveClass('lesson-expiry-warning');
  expect(screen.getByRole('link', { name: 'Renew access' })).toHaveAttribute('href', '/courses/ict/lessons/one/exam-success-pack');
});
