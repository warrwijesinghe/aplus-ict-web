// Analytics is intentionally optional. It provides a safe integration point
// without collecting learner identities, tokens, or private progress data.
export const trackPublicEvent = (name, properties = {}) => {
  const analytics = window.__APLUS_ICT_ANALYTICS__;
  if (typeof analytics?.track !== 'function') return;
  analytics.track(name, properties);
};
