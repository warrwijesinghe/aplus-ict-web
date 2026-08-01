const CAMPAIGN_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

// Campaign parameters are kept only for the current tab. They deliberately do
// not become part of canonical URLs or contain personal/learning information.
export const rememberCampaignAttribution = (search = window.location.search) => {
  const params = new URLSearchParams(search);
  const attribution = Object.fromEntries(CAMPAIGN_KEYS.flatMap((key) => {
    const value = params.get(key);
    return value ? [[key, value.slice(0, 160)]] : [];
  }));
  if (Object.keys(attribution).length) sessionStorage.setItem('aplus_campaign', JSON.stringify(attribution));
  return attribution;
};

const campaignAttribution = () => {
  try { return JSON.parse(sessionStorage.getItem('aplus_campaign') || '{}'); } catch { return {}; }
};

// Analytics is intentionally optional. It provides a safe integration point
// without collecting learner identities, tokens, order details, or progress data.
export const trackPublicEvent = (name, properties = {}) => {
  const analytics = window.__APLUS_ICT_ANALYTICS__;
  if (typeof analytics?.track !== 'function') return;
  analytics.track(name, { ...campaignAttribution(), ...properties });
};
