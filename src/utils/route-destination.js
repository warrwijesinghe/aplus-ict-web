export const safeDestination = (value, fallback = '/') =>
  typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.includes('\\') && ![...value].some((char) => char.charCodeAt(0) < 32) ? value : fallback;
export const destinationForUser = (user) => {
  const roles = user?.roles?.map((role) => (typeof role === 'string' ? role : role.code)) || [];
  if (roles.includes('student')) return '/student/explore';
  return '/';
};
