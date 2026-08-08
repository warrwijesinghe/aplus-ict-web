import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, test, vi } from 'vitest';
import { contentApi } from '../src/api/content.api.js';
import { AuthContext } from '../src/auth/auth-context.jsx';
import { PublicHeader } from '../src/components/layout/PublicHeader.jsx';
import { PlatformHomePage } from '../src/pages/AcademicAreaPages.jsx';

const renderWithProviders = (ui, auth = { isAuthenticated: false, user: null }) => render(
  <MemoryRouter><AuthContext.Provider value={auth}><QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{ui}</QueryClientProvider></AuthContext.Provider></MemoryRouter>
);

afterEach(() => vi.restoreAllMocks());

test('renders the focused Grades 6–13 homepage with one H1', () => {
  renderWithProviders(<PlatformHomePage />);
  expect(screen.getByRole('heading', { level: 1, name: /study ict anytime. anywhere/i })).toBeInTheDocument();
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  expect(screen.getByRole('link', { name: 'Start Free ICT Learning Now' })).toHaveAttribute('href', '/free-lessons');
});

test('renders the learning-freedom sections between course collections with their guest CTA destinations and accessible imagery', async () => {
  vi.spyOn(contentApi, 'publicCourses').mockResolvedValue({ data: [] });
  renderWithProviders(<PlatformHomePage />);
  await waitFor(() => expect(screen.getByRole('heading', { level: 2, name: 'Study Anytime, From Your Own Place' })).toBeInTheDocument());
  expect(screen.getByRole('heading', { level: 2, name: 'Study on the Device You Already Use' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 2, name: 'Learn at Your Own Speed, in Your Own Way' })).toBeInTheDocument();

  const anywhereSection = document.getElementById('study-anywhere');
  const deviceSection = document.getElementById('study-any-device');
  const paceSection = document.getElementById('study-own-pace');
  expect(within(anywhereSection).getByRole('link', { name: 'A/L ICT' })).toHaveAttribute('href', '/al-ict');
  expect(within(anywhereSection).getByRole('link', { name: 'O/L ICT' })).toHaveAttribute('href', '/ol-ict');
  expect(within(anywhereSection).getByRole('link', { name: 'Grades 6–9 ICT' })).toHaveAttribute('href', '/school-ict');
  expect(within(anywhereSection).getByText(/ඔබට පහසු තැනකින්/)).toHaveAttribute('lang', 'si');
  expect(within(anywhereSection).getAllByRole('img')).toHaveLength(3);
  expect(within(anywhereSection).getAllByRole('img').every((image) => image.getAttribute('alt'))).toBe(true);
  expect(anywhereSection.previousElementSibling).toHaveClass('home-course-collection-al');
  expect(deviceSection.previousElementSibling).toHaveClass('home-course-collection-ol');
  expect(paceSection.previousElementSibling).toHaveClass('home-course-collection-school');
});

test('groups homepage courses by school stage in database display order', async () => {
  vi.spyOn(contentApi, 'publicCourses').mockResolvedValue({ data: [
    { id: 'school-2', courseGroup: 'SCHOOL', medium: { code: 'en', nameEn: 'English Medium' }, sortOrder: 20, title: 'Grade 9 ICT', slug: 'grade-9-ict-en' },
    { id: 'al-2', courseGroup: 'AL', medium: { code: 'en', nameEn: 'English Medium' }, sortOrder: 20, title: 'A/L ICT - Part 2', slug: 'al-ict-en-part-2' },
    { id: 'ol-1', courseGroup: 'OL', medium: { code: 'en', nameEn: 'English Medium' }, sortOrder: 10, title: 'O/L ICT - Part 1', slug: 'ol-ict-en-part-1' },
    { id: 'ol-2', courseGroup: 'OL', medium: { code: 'en', nameEn: 'English Medium' }, sortOrder: 20, title: 'O/L ICT - Part 2', slug: 'ol-ict-en-part-2' },
    { id: 'ol-3', courseGroup: 'OL', medium: { code: 'en', nameEn: 'English Medium' }, sortOrder: 30, title: 'O/L ICT - Part 3', slug: 'ol-ict-en-part-3' },
    { id: 'al-1', courseGroup: 'AL', medium: { code: 'en', nameEn: 'English Medium' }, sortOrder: 10, title: 'A/L ICT - Part 1', slug: 'al-ict-en-part-1' },
    { id: 'school-1', availabilityStatus: 'active', courseGroup: 'SCHOOL', medium: { code: 'en', nameEn: 'English Medium' }, sortOrder: 10, title: 'Grade 6 ICT', slug: 'grade-6-ict-en' }
  ] });
  renderWithProviders(<PlatformHomePage />);
  await waitFor(() => expect(screen.getByRole('heading', { level: 2, name: 'A/L ICT Courses' })).toBeInTheDocument());

  const alSection = document.querySelector('.home-course-collection-al');
  const olSection = document.querySelector('.home-course-collection-ol');
  const schoolSection = document.querySelector('.home-course-collection-school');
  expect(within(alSection).getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)).toEqual(['A/L ICT - Part 1', 'A/L ICT - Part 2']);
  expect(within(olSection).getByRole('heading', { level: 3, name: 'O/L ICT - Part 1' })).toBeInTheDocument();
  expect(within(schoolSection).getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)).toEqual(['Grade 6 ICT', 'Grade 9 ICT']);
  expect(alSection.querySelector('.home-course-grid')).toHaveClass('home-course-grid-2');
  expect(olSection.querySelector('.home-course-grid')).toHaveClass('home-course-grid-3');
  expect(within(alSection).getByRole('link', { name: 'View all A/L ICT Courses' })).toHaveAttribute('href', '/al-ict');
  expect(within(olSection).getByRole('link', { name: 'View all O/L ICT Courses' })).toHaveAttribute('href', '/ol-ict');
  expect(within(schoolSection).getByRole('link', { name: 'View all Grades 6–9 ICT Courses' })).toHaveAttribute('href', '/school-ict');
  const gradeSixCard = within(schoolSection).getByRole('heading', { level: 3, name: 'Grade 6 ICT' }).closest('article');
  expect(within(gradeSixCard).getByRole('link', { name: 'View Course' })).toHaveAttribute('href', '/courses/grade-6-ict-en');
});

test('shows the four essential FAQ questions and educator identity', () => {
  renderWithProviders(<PlatformHomePage />);
  expect(document.querySelectorAll('.faq-list details')).toHaveLength(4);
  expect(screen.getByText('Can I study using a mobile phone?')).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 3, name: 'WARR Wijesinghe' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /learn about a plus ict/i })).toHaveAttribute('href', '/about');
});

test('places the course collections directly after the homepage hero', () => {
  renderWithProviders(<PlatformHomePage />);
  const hero = document.querySelector('.platform-home-hero');
  expect(hero.nextElementSibling).toHaveClass('home-course-loading');
  expect(document.querySelector('.learning-steps')).not.toBeInTheDocument();
  expect(document.querySelector('.final-home-cta')).not.toBeInTheDocument();
});

test('guest header uses Student Login and a student sees My Learning', async () => {
  vi.spyOn(contentApi, 'siteProfile').mockResolvedValue({ data: {} });
  const guest = renderWithProviders(<PublicHeader />);
  expect(await screen.findByText('Student Login')).toBeInTheDocument();
  guest.unmount();
  renderWithProviders(<PublicHeader />, { isAuthenticated: true, user: { name: 'Student', roles: [{ code: 'student' }] } });
  expect(await screen.findByText('My Learning')).toBeInTheDocument();
});

test('mobile navigation retains accessible attributes and closes with Escape', async () => {
  vi.spyOn(contentApi, 'siteProfile').mockResolvedValue({ data: {} });
  renderWithProviders(<PublicHeader />);
  const trigger = screen.getByRole('button', { name: /open navigation menu/i });
  fireEvent.click(trigger);
  expect(trigger).toHaveAttribute('aria-controls', 'public-navigation');
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  expect(document.body).toHaveClass('navigation-open');
  await waitFor(() => expect(screen.getByRole('link', { name: /grades 6/i })).toHaveFocus());
  fireEvent.keyDown(document, { key: 'Escape' });
  await waitFor(() => expect(trigger).toHaveFocus());
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(document.body).not.toHaveClass('navigation-open');
});
