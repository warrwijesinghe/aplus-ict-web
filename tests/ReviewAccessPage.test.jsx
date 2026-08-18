import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ReviewAccessPage } from '../src/pages/ReviewAccessPage.jsx';

const reviewerLogin = vi.fn();
const navigate = vi.fn();

vi.mock('../src/auth/auth-context.jsx', () => ({ useAuth: () => ({ reviewerLogin }) }));
vi.mock('react-router-dom', async () => ({ ...(await vi.importActual('react-router-dom')), useNavigate: () => navigate }));

describe('ReviewAccessPage', () => {
  beforeEach(() => {
    reviewerLogin.mockReset();
    navigate.mockReset();
  });

  test('renders a usable restricted sign-in form and shows API failures', async () => {
    reviewerLogin.mockRejectedValue(new Error('Invalid review credentials.'));
    render(<MemoryRouter><ReviewAccessPage /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Platform Review Access' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'review@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Invalid review credentials.'));
    expect(document.head.querySelector('meta[name="robots"]')?.content).toBe('noindex, nofollow');
  });
});
