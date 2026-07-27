import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { PublicHomePage } from '../src/pages/PublicCoursePages.jsx';

test('renders the public learning message', () => {
  render(
    <MemoryRouter>
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
        <PublicHomePage />
      </QueryClientProvider>
    </MemoryRouter>
  );
  expect(
    screen.getByRole('heading', { name: /a\/l ict .* ක්‍රමානුකූලව/i })
  ).toBeInTheDocument();
});
