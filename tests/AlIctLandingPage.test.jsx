import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AlIctLandingPage } from '../src/pages/AlIctPages.jsx';

vi.mock('../src/api/content.api.js', () => ({
  contentApi: { publicAlIctCourse: vi.fn().mockRejectedValue(new Error('Catalogue not seeded')) }
}));

test('offers Sinhala and English A/L ICT tracks even before titles are published', async () => {
  render(
    <MemoryRouter>
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
        <AlIctLandingPage />
      </QueryClientProvider>
    </MemoryRouter>
  );

  expect(screen.getByRole('heading', { name: /ඔබගේ a\/l ict learning path/i })).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: /explore 13 lessons/i })[0]).toHaveAttribute(
    'href',
    '/al-ict/sinhala-medium'
  );
  expect(screen.getByText('English Medium')).toBeInTheDocument();
});
