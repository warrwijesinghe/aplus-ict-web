import { render, screen, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { expect, test, vi } from 'vitest';
import { StudentOrdersPage } from '../src/pages/ExamSuccessPackPage.jsx';

vi.mock('../src/api/commerce.api.js', () => ({ commerceApi: { studentOrders: vi.fn(async () => ({ items: [
  { id: 'sinhala', orderNumber: '26100002', total: 2800, paymentStatus: 'unpaid', items: [{ name: 'Concept of ICT', medium: { code: 'sinhala', name: 'Sinhala' } }] },
  { id: 'english', orderNumber: '26100003', total: 2800, paymentStatus: 'unpaid', items: [{ name: 'Concept of ICT', medium: { code: 'english', name: 'English Medium' } }] }
] })) } }));

test('identical lesson titles show the medium on their own order cards', async () => {
  render(<QueryClientProvider client={new QueryClient()}><MemoryRouter><StudentOrdersPage /></MemoryRouter></QueryClientProvider>);
  const sinhala = (await screen.findByText('Order #26100002')).closest('article');
  const english = screen.getByText('Order #26100003').closest('article');
  expect(within(sinhala).getByText('Sinhala Medium')).toBeInTheDocument();
  expect(within(english).getByText('English Medium')).toBeInTheDocument();
  expect(within(sinhala).queryByText('English Medium')).not.toBeInTheDocument();
  expect(screen.queryByText('English Medium Medium')).not.toBeInTheDocument();
});
