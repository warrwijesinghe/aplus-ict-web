import { render, screen, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { CourseSelectionPage } from '../src/pages/CourseSelectionPage.jsx';

const courseSelection = vi.hoisted(() => vi.fn());
vi.mock('../src/api/content.api.js', () => ({ contentApi: { courseSelection } }));
const show = (path = '/courses') => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><MemoryRouter initialEntries={[path]}><CourseSelectionPage /></MemoryRouter></QueryClientProvider>);

describe('course selection', () => {
  it('links each category to its landing page for students', async () => {
    courseSelection.mockResolvedValue({ data: [
      { id: 'one', slug: 'grade-6-sinhala', title: 'Grade 6 ICT', courseGroup: 'SCHOOL', medium: 'Sinhala', availabilityStatus: 'active' },
      { id: 'two', slug: 'grade-6-english', title: 'Grade 6 ICT', courseGroup: 'SCHOOL', medium: 'English', availabilityStatus: 'inactive' }
    ] });
    show();
    await screen.findByRole('link', { name: /Grade 6–9 ICT/ });
    expect(screen.queryByText('Grade 6 ICT')).not.toBeInTheDocument();
    for (const title of ['O/L ICT', 'A/L ICT', 'Degree', 'Professional Certifications', 'Short Courses']) expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    for (const [name, path] of [['Grade 6–9 ICT', '/school-ict'], ['O/L ICT', '/ol-ict'], ['A/L ICT', '/al-ict'], ['Degree', '/degree'], ['Professional Certifications', '/professional-certifications'], ['Short Courses', '/short-courses']]) {
      expect(screen.getByRole('link', { name: new RegExp(name) })).toHaveAttribute('href', path);
    }
  });

  it('opens Short Courses and displays active and coming-soon courses', async () => {
    courseSelection.mockResolvedValue({ data: [
      { id: 'active-short', slug: 'digital-skills', title: 'Digital Skills', courseGroup: 'SHORT_COURSES', medium: 'English', availabilityStatus: 'active' },
      { id: 'future-short', slug: 'web-basics', title: 'Web Basics', courseGroup: 'SHORT_COURSES', medium: 'English', availabilityStatus: 'inactive' },
      { id: 'school', slug: 'school', title: 'School course', courseGroup: 'SCHOOL', availabilityStatus: 'active' }
    ] });
    show('/courses?category=short_courses');
    await screen.findByText('Digital Skills');
    expect(screen.getByRole('heading', { level: 1, name: 'Short Courses' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /English medium.*Digital Skills/ })).toHaveAttribute('href', '/courses/digital-skills');
    expect(within(screen.getByText('Web Basics').closest('article')).getByText('Coming soon')).toBeInTheDocument();
    expect(screen.queryByText('School course')).not.toBeInTheDocument();
  });

  it('opens a direct category link and shows an empty category as coming soon', async () => {
    courseSelection.mockResolvedValue({ data: [] });
    show('/courses?category=degree');
    expect(await screen.findByText('Courses in this category are coming soon.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Degree' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /all categories/i })).toHaveAttribute('href', '/courses');
  });

  it('shows an error instead of claiming courses are coming soon when the API fails', async () => {
    courseSelection.mockRejectedValue(new Error('Network error'));
    show();
    expect(await screen.findByRole('alert')).toHaveTextContent('Courses could not be loaded');
    expect(screen.queryByText('Coming soon')).not.toBeInTheDocument();
  });
});
