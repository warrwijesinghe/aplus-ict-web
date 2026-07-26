import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from '../src/pages/HomePage.jsx';

test('renders the public learning message', () => {
  render(
    <MemoryRouter>
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
        <HomePage />
      </QueryClientProvider>
    </MemoryRouter>
  );
  expect(
    screen.getByRole('heading', { name: /learn ict with a clear path forward/i })
  ).toBeInTheDocument();
});
