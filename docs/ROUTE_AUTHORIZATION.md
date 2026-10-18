# Route authorization

`ProtectedRoute` waits for session restoration and redirects signed-out visitors to `/login`. `GuestOnlyRoute` redirects signed-in students to their student portal. `RoleRoute` protects student pages. The separate Admin application provides the staff workspace and content management.

Navigation visibility is only a convenience. The API remains the authorization authority for student data and content access.
