import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PublicHomePage } from '../src/pages/PublicCoursePages.jsx';

test('renders the official public learning message', () => {
  render(
    <MemoryRouter>
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
        <PublicHomePage />
      </QueryClientProvider>
    </MemoryRouter>
  );
  expect(screen.getByRole('heading', { name: /learn a\/l ict with clarity/i })).toBeInTheDocument();
});
