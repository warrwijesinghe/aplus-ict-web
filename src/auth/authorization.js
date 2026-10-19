const codes = (roles = []) => roles.map((role) => (typeof role === 'string' ? role : role.code));
export const hasRole = (user, role) => codes(user?.roles?.length ? user.roles : user?.role ? [user.role] : []).includes(role);
export const hasPermission = (user, permission) => user?.permissions?.includes(permission) || false;
export const hasAnyPermission = (user, permissions) =>
  permissions.some((permission) => hasPermission(user, permission));
