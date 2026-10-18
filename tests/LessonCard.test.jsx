import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, test } from 'vitest';
import { LessonCard } from '../src/components/courses/LessonCard.jsx';
import { LessonPageTemplate } from '../src/components/courses/LessonPageTemplate.jsx';

test('makes the entire lesson card one link to its course lesson page', () => {
  render(<MemoryRouter><LessonCard courseSlug="grade-6-ict-english" lesson={{ id: 'one', slug: 'computers', title: 'Importance of Computers', lessonNumber: 1, freeContentCount: 1, paidContentCount: 1 }} image="/lesson.jpg" /></MemoryRouter>);
  const link = screen.getByRole('link');
  expect(link).toHaveAttribute('href', '/courses/grade-6-ict-english/lessons/computers');
  expect(link).toContainElement(screen.getByRole('heading', { name: 'Importance of Computers' }));
  expect(screen.getByText('Available')).toBeInTheDocument();
  expect(screen.getByText('Start Learning Free')).toBeInTheDocument();
  expect(screen.queryByText('Available lesson')).not.toBeInTheDocument();
});

test('shows a coming-soon lesson without inventing a price', () => {
  render(<MemoryRouter><LessonCard courseSlug="al-ict-sinhala" lesson={{ id: 'two', title: 'Future lesson', lessonNumber: 2 }} /></MemoryRouter>);
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Coming Soon' })).toBeDisabled();
  expect(screen.queryByText(/LKR/)).not.toBeInTheDocument();
});

test('shared lesson template requires sign-in before showing learning content', () => {
  render(<MemoryRouter><LessonPageTemplate course={{ title: 'Grade 6 ICT' }} lesson={{ title: 'Computers', topics: [] }} courseSlug="grade-6-ict-english" isAuthenticated={false} enrollment={{}} returnTo="/courses/grade-6-ict-english/lessons/computers" topics={<p>Protected material</p>} /></MemoryRouter>);
  expect(screen.getByRole('heading', { level: 1, name: 'Computers' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Sign in with your phone/ })).toHaveAttribute('href', '/login?returnTo=%2Fcourses%2Fgrade-6-ict-english%2Flessons%2Fcomputers');
  expect(screen.queryByText('Protected material')).not.toBeInTheDocument();
});

test.each([
  ['sinhala', 'Sinhala Medium'],
  [{ code: 'english' }, 'English Medium'],
  [['sinhala', 'english'], 'Sinhala + English']
])('uses dynamic medium %j and the supplied product price', (medium, label) => {
  render(<MemoryRouter><LessonCard course={{ medium }} courseSlug="course" lesson={{ id: 'lesson', title: 'Lesson title', lessonNumber: 1, freeContentCount: 1, unlockProduct: { price: 1400 } }} /></MemoryRouter>);
  expect(screen.getByText(label)).toBeInTheDocument();
  expect(screen.getByText('LKR 1,400')).toBeInTheDocument();
  expect(screen.queryByText('Free Preview')).not.toBeInTheDocument();
  expect(screen.queryByText('Full Lesson')).not.toBeInTheDocument();
});

test('disables unpublished lessons even if content counts exist', () => {
  render(<MemoryRouter><LessonCard courseSlug="course" lesson={{ id: 'draft', title: 'Draft lesson', lessonNumber: 2, status: 'draft', freeContentCount: 3 }} /></MemoryRouter>);
  expect(screen.getByRole('button', { name: 'Coming Soon' })).toBeDisabled();
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
});
