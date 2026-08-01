import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { loadEnv } from 'vite';
import { DEFAULT_OG_IMAGE, PUBLIC_ROUTE_SEO, PUBLIC_SITEMAP_PATHS, absoluteUrl, pageTitle } from '../src/seo/public-seo-config.js';

const root = resolve(import.meta.dirname, '..');
const escapeHtml = (value = '') => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const schemaFor = (path, siteUrl) => {
  if (path === '/') return { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebSite', name: 'A Plus ICT', url: siteUrl },
    { '@type': 'EducationalOrganization', name: 'A Plus ICT', alternateName: 'A Plus ICT Learning', url: siteUrl, logo: absoluteUrl('/images/logo.png', siteUrl) }
  ] };
  if (['/school-ict', '/ol-ict', '/al-ict'].includes(path)) return { '@context': 'https://schema.org', '@graph': [
    { '@type': 'CollectionPage', name: PUBLIC_ROUTE_SEO[path].title, url: absoluteUrl(path, siteUrl) },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/', siteUrl) },
      { '@type': 'ListItem', position: 2, name: PUBLIC_ROUTE_SEO[path].title, item: absoluteUrl(path, siteUrl) }
    ] }
  ] };
  return null;
};

const headFor = (path, data, siteUrl, indexable) => {
  const canonical = absoluteUrl(path, siteUrl);
  const image = absoluteUrl(DEFAULT_OG_IMAGE, siteUrl);
  const robots = indexable && !data.noIndex ? 'index, follow' : 'noindex, nofollow';
  const schema = schemaFor(path, siteUrl);
  return `\n    <title>${escapeHtml(pageTitle(data.title))}</title>\n    <meta name="description" content="${escapeHtml(data.description)}" />\n    <meta name="robots" content="${robots}" />\n    <link rel="canonical" href="${canonical}" />\n    <meta property="og:site_name" content="A Plus ICT" />\n    <meta property="og:type" content="website" />\n    <meta property="og:title" content="${escapeHtml(pageTitle(data.title))}" />\n    <meta property="og:description" content="${escapeHtml(data.description)}" />\n    <meta property="og:url" content="${canonical}" />\n    <meta property="og:image" content="${image}" />\n    <meta name="twitter:card" content="summary_large_image" />\n    <meta name="twitter:title" content="${escapeHtml(pageTitle(data.title))}" />\n    <meta name="twitter:description" content="${escapeHtml(data.description)}" />\n    <meta name="twitter:image" content="${image}" />${schema ? `\n    <script id="page-structured-data" type="application/ld+json">${JSON.stringify(schema)}</script>` : ''}\n  `;
};

const viteAssetTags = (html) => (html.match(/<(?:script|link)\b[^>]+(?:src|href)="(?:\/assets\/)[^"]+"[^>]*><\/script>|<link\b[^>]+href="\/assets\/[^"]+"[^>]*>/g) || []).join('\n    ');

export const generatePublicSeo = ({ mode = 'production', env: suppliedEnv } = {}) => {
  const env = suppliedEnv || loadEnv(mode, root, '');
  const indexable = mode === 'production' && env.VITE_SITE_INDEXABLE === 'true';
  const siteUrl = (env.VITE_PUBLIC_SITE_URL || 'https://www.aplusict.lk').replace(/\/$/, '');
  const dist = resolve(root, 'dist');
  const index = readFileSync(resolve(dist, 'index.html'), 'utf8');
  const assets = viteAssetTags(index);

  for (const [path, data] of Object.entries(PUBLIC_ROUTE_SEO)) {
    const html = index.replace(/<head>[\s\S]*?<\/head>/, `<head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />${headFor(path, data, siteUrl, indexable)}    ${assets}\n  </head>`);
    const target = path === '/' ? resolve(dist, 'index.html') : resolve(dist, path.slice(1), 'index.html');
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, html);
  }

  const sitemap = indexable
    ? `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${PUBLIC_SITEMAP_PATHS.map((path) => `  <url><loc>${absoluteUrl(path, siteUrl)}</loc></url>`).join('\n')}\n</urlset>\n`
    : '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>\n';
  writeFileSync(resolve(dist, 'sitemap.xml'), sitemap);
  writeFileSync(resolve(dist, 'robots.txt'), indexable ? `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n');
  // Dynamic course and lesson URLs can be added here after reliable API-backed build-time data is available.
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const mode = process.argv.includes('--mode') ? process.argv[process.argv.indexOf('--mode') + 1] : 'production';
  generatePublicSeo({ mode });
}
