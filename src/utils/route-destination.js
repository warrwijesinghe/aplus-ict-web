export const safeDestination = (value, fallback = '/') =>
  value && value.startsWith('/') && !value.startsWith('//') ? value : fallback;
export const destinationForUser = (user) => {
  const roles = user?.roles?.map((role) => (typeof role === 'string' ? role : role.code)) || [];
  if (roles.some((role) => ['super_admin', 'admin'].includes(role))) return '/admin';
  if (roles.includes('teacher')) return '/teacher';
  if (roles.includes('student')) return '/student';
  return '/';
};
