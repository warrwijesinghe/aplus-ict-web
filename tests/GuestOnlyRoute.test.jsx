import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { expect, test, vi } from 'vitest';

vi.mock('../src/auth/auth-context.jsx', () => ({ useAuth: () => ({ isAuthenticated: true, user: { role: 'student' } }) }));
import { GuestOnlyRoute } from '../src/auth/guest-only-route.jsx';

const Destination = () => { const location = useLocation(); return <p>{location.pathname + location.search}</p>; };

test.each([
  { entry: '/login?returnTo=' + encodeURIComponent('/enroll/al-ict?returnTo=/courses/al-ict/lessons/one/learn'), destination: '/enroll/al-ict?returnTo=/courses/al-ict/lessons/one/learn' },
  { entry: '/login', destination: '/courses' },
  { entry: '/login?returnTo=https%3A%2F%2Fexample.com', destination: '/courses' },
])('authenticated login guard keeps the requested flow: $entry', ({ entry, destination }) => {
  render(<MemoryRouter initialEntries={[entry]}><Routes><Route element={<GuestOnlyRoute />}><Route path="/login" element={<p>Login</p>} /></Route><Route path="*" element={<Destination />} /></Routes></MemoryRouter>);
  expect(screen.getByText(destination)).toBeInTheDocument();
});
