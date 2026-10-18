import { render, screen, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DegreePage, ProfessionalCertificationsPage, SchoolIctPage, ShortCoursesPage } from '../src/pages/AcademicAreaPages.jsx';

const api = vi.hoisted(() => ({ publicCourses: vi.fn(), courseSelection: vi.fn() }));
vi.mock('../src/api/content.api.js', () => ({ contentApi: api }));

const show = (page) => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><MemoryRouter>{page}</MemoryRouter></QueryClientProvider>);

describe('category landing pages', () => {
  beforeEach(() => { api.publicCourses.mockReset(); api.courseSelection.mockReset(); api.publicCourses.mockResolvedValue({ data: [] }); api.courseSelection.mockResolvedValue({ data: [] }); });

  it.each([
    [DegreePage, 'Explore Degree Courses'],
    [ProfessionalCertificationsPage, 'Explore Professional Certifications'],
    [ShortCoursesPage, 'Explore Short Courses']
  ])('shows a landing page and an empty coming-soon state', async (Page, heading) => {
    show(<Page />);
    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
    expect(await screen.findByText('Courses in this category are coming soon')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Explore all categories' })).toHaveAttribute('href', '/courses');
  });

  it('shows active and coming-soon short courses without mixing categories', async () => {
    api.courseSelection.mockResolvedValue({ data: [
      { id: 'active', slug: 'digital-skills', title: 'Digital Skills', medium: 'English', courseGroup: 'SHORT_COURSES', availabilityStatus: 'active' },
      { id: 'soon', slug: 'web-basics', title: 'Web Basics', medium: 'English', courseGroup: 'SHORT_COURSES', availabilityStatus: 'inactive' },
      { id: 'other', slug: 'degree', title: 'Degree course', courseGroup: 'DEGREE', availabilityStatus: 'active' }
    ] });
    show(<ShortCoursesPage />);
    expect(await screen.findByRole('link', { name: 'Explore Digital Skills, English medium' })).toHaveAttribute('href', '/courses/digital-skills');
    const soon = screen.getByText('Web Basics').closest('article');
    expect(within(soon).getByText('Coming soon')).toBeInTheDocument();
    expect(within(soon).queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByText('Degree course')).not.toBeInTheDocument();
  });

  it('includes inactive school courses on the existing school page', async () => {
    api.courseSelection.mockResolvedValue({ data: [{ id: 'soon', title: 'Grade 6 ICT', medium: 'English', courseGroup: 'SCHOOL', availabilityStatus: 'inactive' }] });
    show(<SchoolIctPage />);
    const card = (await screen.findByText('Grade 6 ICT')).closest('article');
    expect(within(card).getByText('Coming soon')).toBeInTheDocument();
  });

  it('shows compact school course cards with the title, medium and course link', async () => {
    api.publicCourses.mockResolvedValue({ data: [{ id: 'six', slug: 'grade-6-english', title: 'Grade 6 ICT', courseGroup: 'SCHOOL', medium: { code: 'english', nameEn: 'English Medium' } }] });
    show(<SchoolIctPage />);
    const card = (await screen.findByRole('heading', { name: 'Grade 6 ICT' })).closest('article');
    expect(card).toHaveClass('catalogue-course-card-compact');
    expect(within(card).getByText('English Medium')).toBeInTheDocument();
    expect(within(card).getByRole('link', { name: 'View Grade 6 ICT, English medium' })).toHaveAttribute('href', '/courses/grade-6-english');
    expect(within(card).queryByRole('list')).not.toBeInTheDocument();
  });
});
