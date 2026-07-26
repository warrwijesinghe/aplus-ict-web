const apiMode = import.meta.env.VITE_API_MODE ?? 'direct';
const gatewayBases = Object.freeze({
  auth: '/api/auth',
  content: '/api/content',
  learning: '/api/learning',
  commerce: '/api/commerce',
  resource: '/api/resources'
});

if (!['direct', 'gateway'].includes(apiMode))
  throw new Error('VITE_API_MODE must be either "direct" or "gateway"');

export const serviceUrls = Object.freeze(
  apiMode === 'gateway'
    ? gatewayBases
    : {
        auth: import.meta.env.VITE_AUTH_API_URL,
        content: import.meta.env.VITE_CONTENT_API_URL,
        learning: import.meta.env.VITE_LEARNING_API_URL,
        commerce: import.meta.env.VITE_COMMERCE_API_URL,
        resource: import.meta.env.VITE_RESOURCE_API_URL
      }
);
