import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '../auth/auth-provider.jsx';
import { OrderSelectionProvider } from '../features/store/selection-context.jsx';
import { queryClient } from './query-client.js';
import { router } from './router.jsx';
export const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <OrderSelectionProvider>
        <RouterProvider router={router} />
      </OrderSelectionProvider>
    </AuthProvider>
  </QueryClientProvider>
);
