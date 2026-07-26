# Route authorization

`ProtectedRoute` waits for session restoration and redirects signed-out visitors to `/login`. `GuestOnlyRoute` redirects signed-in users to the portal determined from real role codes. `RoleRoute` protects student, teacher, and administrator shells; `PermissionRoute` protects specific administrator route groups using `/me` permission codes.

Navigation visibility is only a convenience. The backend remains the authorization authority. The audit identifies Content Service management routes that currently lack server-side permission middleware.
