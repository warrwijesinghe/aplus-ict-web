import { useEffect } from 'react';

const siteName = 'A Plus ICT';
const configuredSiteUrl = import.meta.env.VITE_PUBLIC_SITE_URL?.replace(/\/$/, '');

const setMetaContent = (selector, content) => {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('meta');
    const [attribute, value] = selector.match(/\[(.+?)="(.+?)"\]/)?.slice(1) || [];

    if (!attribute || !value) return;
    element.setAttribute(attribute, value);
    document.head.append(element);
  }

  element.setAttribute('content', content);
};

// Public routes use this small hook so titles, descriptions, social previews,
// canonical URLs, and structured data stay close to the page they describe.
export const usePageSeo = ({
  description,
  keywords = 'A/L ICT, Sri Lanka ICT lessons, A Plus ICT',
  noIndex = false,
  path,
  structuredData,
  title
}) => {
  useEffect(() => {
    const pageTitle = title ? title + ' | ' + siteName : siteName;
    const canonicalUrl = (configuredSiteUrl || window.location.origin) + path;
    const developmentNoIndex = import.meta.env.VITE_SITE_INDEXABLE === 'false';

    document.title = pageTitle;
    setMetaContent('meta[name="description"]', description);
    setMetaContent('meta[name="keywords"]', keywords);
    setMetaContent('meta[property="og:title"]', pageTitle);
    setMetaContent('meta[property="og:description"]', description);
    setMetaContent('meta[property="og:url"]', canonicalUrl);
    setMetaContent('meta[property="og:type"]', 'website');
    setMetaContent('meta[name="twitter:card"]', 'summary_large_image');
    setMetaContent('meta[name="robots"]', noIndex || developmentNoIndex ? 'noindex, nofollow' : 'index, follow');

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.append(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    const existingSchema = document.getElementById('page-structured-data');
    if (!structuredData) {
      existingSchema?.remove();
      return;
    }

    const schema = existingSchema || document.createElement('script');
    schema.id = 'page-structured-data';
    schema.type = 'application/ld+json';
    schema.textContent = JSON.stringify(structuredData);
    if (!existingSchema) document.head.append(schema);
  }, [description, keywords, noIndex, path, structuredData, title]);
};
