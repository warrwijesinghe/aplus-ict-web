import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { PhoneAuthPage } from '../src/pages/PhoneAuthPage.jsx';
import { authApi } from '../src/api/auth.api.js';

const { login, register, navigate } = vi.hoisted(() => ({ login: vi.fn(), register: vi.fn(), navigate: vi.fn() }));
vi.mock('../src/auth/auth-context.jsx', () => ({ useAuth: () => ({ login, register }) }));
vi.mock('../src/api/auth.api.js', () => ({ authApi: { requestOtp: vi.fn(), verifyOtp: vi.fn(), resetPassword: vi.fn() } }));
vi.mock('react-router-dom', async () => ({ ...(await vi.importActual('react-router-dom')), useNavigate: () => navigate }));

const type = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const show = (mode = 'login', path = '/login') => render(<MemoryRouter initialEntries={[path]}><PhoneAuthPage mode={mode} /></MemoryRouter>);
const verify = async () => {
  type('Mobile number', '0771234567');
  fireEvent.click(screen.getByRole('button', { name: 'Send verification code' }));
  await screen.findByLabelText('Verification code');
  expect(screen.queryByLabelText('New password')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Resend code in/ })).toBeDisabled();
  type('Verification code', '123456');
  fireEvent.click(screen.getByRole('button', { name: 'Verify phone' }));
  await screen.findByLabelText('New password');
};
describe('phone authentication screens', () => {
  beforeEach(() => {
    vi.clearAllMocks(); sessionStorage.clear();
    authApi.requestOtp.mockResolvedValue({ challengeId: 'challenge', resendAfter: 60, message: 'Code sent' });
    authApi.verifyOtp.mockResolvedValue({ verificationToken: 'proof' });
    login.mockResolvedValue({ role: 'student', roles: ['student'] });
    register.mockResolvedValue({ role: 'student', roles: ['student'] });
  });
  test('signs in with a phone and password and restores the intended course', async () => {
    show('login', '/login?returnTo=%2Fenroll%2Fal-ict');
    type('Mobile number', '0771234567'); type('Password', 'Learning123!');
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/enroll/al-ict', { replace: true }));
    expect(login).toHaveBeenCalledWith({ phoneNumber: '0771234567', password: 'Learning123!' });
  });
  test('verifies before password setup and creates an account with proof', async () => {
    show('register', '/register'); await verify();
    type('Full name', 'Student One'); type('New password', 'Learning123!'); type('Confirm password', 'Learning123!');
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    await waitFor(() => expect(register).toHaveBeenCalledWith({ challengeId: 'challenge', verificationToken: 'proof', name: 'Student One', password: 'Learning123!' }));
    expect(navigate).toHaveBeenCalledWith('/complete-profile?returnTo=%2Fstudent', { replace: true });
  });
  test('rejects mismatched passwords without calling the API', async () => {
    show('register', '/register'); await verify();
    type('Full name', 'Student One'); type('New password', 'Learning123!'); type('Confirm password', 'Different123!');
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Passwords do not match'));
    expect(register).not.toHaveBeenCalled();
  });
  test('resets by OTP and offers a new sign-in without automatically authenticating', async () => {
    show('reset', '/forgot-password'); await verify();
    expect(authApi.requestOtp).toHaveBeenCalledWith({ phoneNumber: '0771234567', purpose: 'reset' });
    type('New password', 'NewPassword123!'); type('Confirm password', 'NewPassword123!');
    fireEvent.click(screen.getByRole('button', { name: 'Reset password' }));
    await screen.findByRole('heading', { name: 'Your password is reset.' });
    expect(authApi.resetPassword).toHaveBeenCalledWith(expect.objectContaining({ verificationToken: 'proof', password: 'NewPassword123!' }));
    expect(login).not.toHaveBeenCalled();
  });
  test('shows an expired-code error and keeps password setup inaccessible', async () => {
    authApi.verifyOtp.mockRejectedValue(new Error('The code is invalid or expired.'));
    show('register', '/register'); type('Mobile number', '0771234567');
    fireEvent.click(screen.getByRole('button', { name: 'Send verification code' }));
    await screen.findByLabelText('Verification code'); type('Verification code', '999999');
    fireEvent.click(screen.getByRole('button', { name: 'Verify phone' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('invalid or expired'));
    expect(screen.queryByLabelText('New password')).not.toBeInTheDocument();
  });
  test('rejects external return destinations and keeps auth pages non-indexed', async () => {
    show('login', '/login?returnTo=https%3A%2F%2Fevil.example');
    type('Mobile number', '0771234567'); type('Password', 'Learning123!');
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/student', { replace: true }));
    expect(document.querySelector('meta[name="robots"]').content).toBe('noindex, nofollow');
  });
});
