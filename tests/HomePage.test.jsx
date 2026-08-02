import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
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

test('shows the Grades 6–13 homepage and direct learning-area links', () => {
  renderWithProviders(<PlatformHomePage />);
  expect(screen.getByRole('heading', { level: 1, name: /study ict anytime. anywhere/i })).toBeInTheDocument();
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  expect(screen.getByLabelText(/study ict anytime. anywhere/i)).toHaveClass('public-hero');
  expect(screen.getByText('Grade 6 to A/L')).toBeInTheDocument();
  expect(screen.getByText('Sinhala & English Medium')).toBeInTheDocument();
  expect(screen.queryByText(/currently available courses/i)).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 2, name: /start ict learning at your school stage/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /choose my grade/i })).toHaveAttribute('href', '/school-ict');
  expect(screen.getByRole('link', { name: /explore o\/l ict/i })).toHaveAttribute('href', '/ol-ict');
  expect(screen.getByRole('link', { name: /explore a\/l ict/i })).toHaveAttribute('href', '/al-ict');
});

test('introduces the A Plus ICT educator through student benefits', () => {
  renderWithProviders(<PlatformHomePage />);
  expect(screen.getByRole('heading', { level: 2, name: /ict learning designed by an educator and software engineer/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 3, name: 'WARR Wijesinghe' })).toBeInTheDocument();
  expect(screen.getByText('Structured learning from Grade 6 to A/L')).toBeInTheDocument();
  expect(screen.getByText('Selected Qualifications')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /learn about a plus ict/i })).toHaveAttribute('href', '/about');
  expect(screen.getByAltText('WARR Wijesinghe, ICT Educator and Founder of A Plus ICT')).toBeInTheDocument();
});

test('guest header uses Student Login and a student sees My Learning', async () => {
  vi.spyOn(contentApi, 'siteProfile').mockResolvedValue({ data: {} });
  const guest = renderWithProviders(<PublicHeader />);
  expect(await screen.findByText('Student Login')).toBeInTheDocument();
  guest.unmount();
  renderWithProviders(<PublicHeader />, { isAuthenticated: true, user: { name: 'Student', roles: [{ code: 'student' }] } });
  expect(await screen.findByText('My Learning')).toBeInTheDocument();
});
