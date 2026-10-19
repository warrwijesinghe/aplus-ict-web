export const safeDestination = (value, fallback = '/') =>
  typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.includes('\\') && ![...value].some((char) => char.charCodeAt(0) < 32) ? value : fallback;
export const destinationForUser = () => '/courses';
