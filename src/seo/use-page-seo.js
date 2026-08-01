import { useEffect } from 'react';
import { DEFAULT_OG_IMAGE, absoluteUrl, getPublicSeo, normalizePath, pageTitle } from './public-seo-config.js';

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

const removeSchema = () => document.getElementById('page-structured-data')?.remove();

// This complements the static public-route HTML generated after builds. Full SSR/SSG
// can be introduced later if large-scale dynamic course and lesson indexing is needed.
export const usePageSeo = ({
  description,
  image = DEFAULT_OG_IMAGE,
  imageAlt = 'A Plus ICT learning platform',
  noIndex = false,
  path,
  structuredData,
  title
}) => {
  useEffect(() => {
    const normalizedPath = normalizePath(path);
    const defaults = getPublicSeo(normalizedPath);
    const resolvedTitle = title || defaults?.title || 'A Plus ICT';
    const resolvedDescription = description || defaults?.description || 'Structured school ICT learning from Grade 6 to A/L.';
    const siteUrl = configuredSiteUrl || window.location.origin;
    const documentTitle = pageTitle(resolvedTitle);
    const canonicalUrl = absoluteUrl(normalizedPath, siteUrl);
    const developmentNoIndex = !import.meta.env.PROD || import.meta.env.VITE_SITE_INDEXABLE !== 'true';
    const imageUrl = image.startsWith('http') ? image : absoluteUrl(image, siteUrl);

    document.title = documentTitle;
    setMetaContent('meta[name="description"]', resolvedDescription);
    setMetaContent('meta[property="og:title"]', documentTitle);
    setMetaContent('meta[property="og:description"]', resolvedDescription);
    setMetaContent('meta[property="og:url"]', canonicalUrl);
    setMetaContent('meta[property="og:type"]', 'website');
    setMetaContent('meta[property="og:image"]', imageUrl);
    setMetaContent('meta[property="og:image:alt"]', imageAlt);
    setMetaContent('meta[name="twitter:card"]', 'summary_large_image');
    setMetaContent('meta[name="twitter:title"]', documentTitle);
    setMetaContent('meta[name="twitter:description"]', resolvedDescription);
    setMetaContent('meta[name="twitter:image"]', imageUrl);
    setMetaContent('meta[name="robots"]', noIndex || defaults?.noIndex || developmentNoIndex ? 'noindex, nofollow' : 'index, follow');

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.append(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    const existingSchema = document.getElementById('page-structured-data');
    if (!structuredData) {
      removeSchema();
      return;
    }

    const schema = existingSchema || document.createElement('script');
    schema.id = 'page-structured-data';
    schema.type = 'application/ld+json';
    schema.textContent = JSON.stringify(structuredData);
    if (!existingSchema) document.head.append(schema);
  }, [description, image, imageAlt, noIndex, path, structuredData, title]);
};
