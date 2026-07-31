const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
export const serviceUrls = Object.freeze({
  auth: apiUrl,
  content: apiUrl,
  learning: apiUrl,
  commerce: apiUrl,
  resource: apiUrl
});
