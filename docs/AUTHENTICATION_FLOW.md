# Authentication flow

At application startup, `AuthProvider` posts to `/api/v1/auth/refresh` with credentials. The HTTP-only refresh cookie is rotated by Auth Service and the resulting access token is retained only by `auth-memory.js`. The provider immediately calls `/api/v1/auth/me` to load roles and permissions.

Login and registration return an access token and set the same refresh cookie. Logout calls the service even if the cookie is gone, then clears memory and authenticated query data. Concurrent bearer-request 401 responses share one refresh promise and each original request can retry once. Login, registration, logout, and refresh requests never trigger recursive refresh.

Student sign-in uses `/auth/phone/login`. Registration requests an SMS code, exchanges it for a short-lived proof, then submits that proof with a password to `/auth/phone/register`. Recovery uses the same verification steps with purpose `reset` and `/auth/phone/reset-password`. Password reset requires a new login and invalidates previous server sessions.

The Google OAuth callback and redirects have been removed. `/login/success` is a compatibility redirect to `/login` and never reads a token from its fragment. Authentication and account transitions clear cached user data.
