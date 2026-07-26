# Authentication flow

At application startup, `AuthProvider` posts to `/api/v1/auth/refresh` with credentials. The HTTP-only refresh cookie is rotated by Auth Service and the resulting access token is retained only by `auth-memory.js`. The provider immediately calls `/api/v1/auth/me` to load roles and permissions.

Login and registration return an access token and set the same refresh cookie. Logout calls the service even if the cookie is gone, then clears memory and authenticated query data. Concurrent bearer-request 401 responses share one refresh promise and each original request can retry once. Login, registration, logout, and refresh requests never trigger recursive refresh.
