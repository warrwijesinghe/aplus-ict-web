import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { GoogleLoginSuccessPage } from '../src/pages/GoogleLoginSuccessPage.jsx';
import { useAuth } from '../src/auth/auth-context.jsx';
import { isProfileComplete, studentLearningApi } from '../src/features/student/student-learning.js';

vi.mock('../src/auth/auth-context.jsx', () => ({
  useAuth: vi.fn()
}));
vi.mock('../src/features/student/student-learning.js', () => ({
  isProfileComplete: vi.fn(),
  studentLearningApi: { profile: vi.fn() }
}));

describe('GoogleLoginSuccessPage', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/login/success');
    studentLearningApi.profile.mockResolvedValue({ isComplete: true });
    isProfileComplete.mockReturnValue(true);
  });

  test('uses the fragment token, removes it from the URL, and loads the student', async () => {
    const completeGoogleLogin = vi.fn().mockResolvedValue({
      role: 'student',
      roles: ['student']
    });
    useAuth.mockReturnValue({
      completeGoogleLogin,
      startGoogleLogin: vi.fn()
    });
    window.history.replaceState({}, '', '/login/success#access_token=test-token');

    render(
      <MemoryRouter initialEntries={['/login/success#access_token=test-token']}>
        <GoogleLoginSuccessPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(completeGoogleLogin).toHaveBeenCalledWith('test-token'));
    expect(window.location.hash).toBe('');
  });

  test('shows a retry state when Google returns without an access token', async () => {
    const completeGoogleLogin = vi.fn();
    useAuth.mockReturnValue({
      completeGoogleLogin,
      startGoogleLogin: vi.fn()
    });

    render(
      <MemoryRouter initialEntries={['/login/success']}>
        <GoogleLoginSuccessPage />
      </MemoryRouter>
    );

    expect(
      await screen.findByRole('heading', { name: 'Sign-in could not be completed' })
    ).toBeInTheDocument();
    expect(completeGoogleLogin).not.toHaveBeenCalled();
  });
});
