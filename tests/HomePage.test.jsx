import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PublicHomePage } from '../src/pages/PublicCoursePages.jsx';
import { AuthContext } from '../src/auth/auth-context.jsx';

test('renders one Grade 6 to A/L catalogue homepage heading', () => {
  render(
    <MemoryRouter>
      <AuthContext.Provider value={{ isAuthenticated: false, user: null }}>
        <QueryClientProvider
          client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
        >
          <PublicHomePage />
        </QueryClientProvider>
      </AuthContext.Provider>
    </MemoryRouter>
  );
  expect(screen.getByRole('heading', { level: 1, name: /ict learning from grade 6 to a\/l/i })).toBeInTheDocument();
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
});
