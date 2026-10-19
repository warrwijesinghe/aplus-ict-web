import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, expect, test, vi } from 'vitest';
import { ExamSuccessPackPage } from '../src/pages/ExamSuccessPackPage.jsx';
import { contentApi } from '../src/api/content.api.js';
import { commerceApi } from '../src/api/commerce.api.js';

vi.mock('../src/api/content.api.js', () => ({ contentApi: { publicLesson: vi.fn() } }));
vi.mock('../src/api/commerce.api.js', () => ({ commerceApi: { examSuccessPack: vi.fn(), createStudentOrder: vi.fn() } }));
const context = (medium) => ({ data: { course: { medium: { code: medium } }, lesson: { id: 'lesson', title: medium === 'sinhala' ? 'තොරතුරු තාක්ෂණය' : 'Concept of ICT', lessonNumber: 7, activities: [{ id: 'free-activity', accessPolicy: 'free' }] } } });
const pack = { product: { id: 'product', price: 3450 }, lesson: { title: 'Concept of ICT' } };
const show = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(<QueryClientProvider client={client}><MemoryRouter initialEntries={['/courses/ict/lessons/one/exam-success-pack']}><Routes><Route path="/courses/:courseSlug/lessons/:lessonSlug/exam-success-pack" element={<ExamSuccessPackPage />} /><Route path="/student/orders/:orderId" element={<p>Existing checkout</p>} /></Routes></MemoryRouter></QueryClientProvider>);
};
beforeEach(() => {
  vi.resetAllMocks();
  contentApi.publicLesson.mockResolvedValue(context('english'));
  commerceApi.examSuccessPack.mockResolvedValue(pack);
  commerceApi.createStudentOrder.mockResolvedValue({ order: { id: 'order' } });
});
test.each([
  ['english', 'Unlock the complete lesson', 'Continue to payment', 'Continue free learning'],
  ['sinhala', 'සම්පූර්ණ පාඩම ලබා ගන්න', 'ගෙවීමට ඉදිරියට යන්න', 'නොමිලේ ඉගෙනීම දිගටම කරගෙන යන්න']
])('%s page shows the actual lesson, price, and existing checkout action', async (medium, title, action, freeAction) => {
  contentApi.publicLesson.mockResolvedValue(context(medium));
  const { container } = show();
  expect(await screen.findByRole('heading', { name: title })).toBeInTheDocument();
  expect(screen.getByText('Rs. 3,450')).toBeInTheDocument();
  expect(screen.getByText(medium === 'sinhala' ? 'පාඩම 07' : 'LESSON 07')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: freeAction })).toHaveAttribute('href', '/courses/ict/lessons/one/activities/free-activity');
  expect(container.textContent).not.toMatch(/[àâÂ�]|premium|Exam Success Pack/i);
  fireEvent.click(screen.getByRole('button', { name: action }));
  expect(await screen.findByText('Existing checkout')).toBeInTheDocument();
  expect(commerceApi.createStudentOrder).toHaveBeenCalledWith('product');
});
test('a pending order resumes the existing order without creating another', async () => {
  commerceApi.examSuccessPack.mockResolvedValue({ ...pack, pendingOrder: { id: 'pending-order' } });
  show();
  expect(await screen.findByRole('link', { name: 'View order' })).toHaveAttribute('href', '/student/orders/pending-order');
  expect(screen.queryByRole('button', { name: 'Continue to payment' })).not.toBeInTheDocument();
  expect(commerceApi.createStudentOrder).not.toHaveBeenCalled();
});
test('already unlocked access continues learning rather than offering another purchase', async () => {
  commerceApi.examSuccessPack.mockResolvedValue({ ...pack, hasActiveEntitlement: true });
  show();
  expect(await screen.findByRole('link', { name: 'Continue learning' })).toHaveAttribute('href', '/courses/ict/lessons/one/learn');
  expect(screen.queryByRole('button', { name: 'Continue to payment' })).not.toBeInTheDocument();
});
test('a failed order creation leaves the lesson and free path available for retry', async () => {
  commerceApi.createStudentOrder.mockRejectedValue(new Error('Unable to create order'));
  show();
  fireEvent.click(await screen.findByRole('button', { name: 'Continue to payment' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to create order');
  expect(screen.getByRole('link', { name: 'Continue free learning' })).toBeInTheDocument();
});
