import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, test, vi } from 'vitest';
import { contentApi } from '../src/api/content.api.js';
import { AuthContext } from '../src/auth/auth-context.jsx';
import { PublicHomePage } from '../src/pages/PublicCoursePages.jsx';

const courses = [
  { id: 'si', slug: 'al-ict-sinhala', title: 'A/L ICT – Sinhala Medium', titleEn: 'A/L ICT – Sinhala Medium', academicLevel: { code: 'AL' }, medium: { code: 'sinhala', nameEn: 'Sinhala Medium' }, availabilityStatus: 'active', syllabusLessonCount: 13, freeContentCount: 3 },
  { id: 'en', slug: 'al-ict-english', title: 'A/L ICT – English Medium', titleEn: 'A/L ICT – English Medium', academicLevel: { code: 'AL' }, medium: { code: 'english', nameEn: 'English Medium' }, availabilityStatus: 'active', syllabusLessonCount: 13, freeContentCount: 3 }
];

const renderHome = () => render(<MemoryRouter><AuthContext.Provider value={{ isAuthenticated: false, user: null }}><QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><PublicHomePage /></QueryClientProvider></AuthContext.Provider></MemoryRouter>);

afterEach(() => vi.restoreAllMocks());

test('renders one A/L-specific homepage heading and routes both hero CTAs to their courses', async () => {
  vi.spyOn(contentApi, 'publicCourses').mockResolvedValue({ data: courses });
  vi.spyOn(contentApi, 'publicCurriculum').mockResolvedValue({ data: { lessons: [] } });
  renderHome();
  expect(screen.getByRole('heading', { level: 1, name: /master a\/l ict/i })).toBeInTheDocument();
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  await waitFor(() => expect(screen.getAllByRole('link', { name: /start sinhala medium/i })[0]).toHaveAttribute('href', '/courses/al-ict-sinhala'));
  expect(screen.getAllByRole('link', { name: /start english medium/i })[0]).toHaveAttribute('href', '/courses/al-ict-english');
});

test('shows only the two A/L medium course cards from the API', async () => {
  vi.spyOn(contentApi, 'publicCourses').mockResolvedValue({ data: courses });
  vi.spyOn(contentApi, 'publicCurriculum').mockResolvedValue({ data: { lessons: [] } });
  renderHome();
  expect(await screen.findByRole('link', { name: 'Explore A/L ICT Sinhala Medium' })).toHaveAttribute('href', '/courses/al-ict-sinhala');
  expect(screen.getByRole('link', { name: 'Explore A/L ICT English Medium' })).toHaveAttribute('href', '/courses/al-ict-english');
});

test('shows a recoverable course loading error', async () => {
  vi.spyOn(contentApi, 'publicCourses').mockRejectedValue(new Error('Courses are unavailable'));
  renderHome();
  expect(await screen.findByRole('alert')).toHaveTextContent('Courses are unavailable');
});
