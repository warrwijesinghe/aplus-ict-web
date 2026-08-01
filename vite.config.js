import { defineConfig } from 'vite';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const publicSeoFiles = (env, mode) => ({
  name: 'public-seo-files',
  closeBundle() {
    const production = mode === 'production' && env.VITE_SITE_INDEXABLE !== 'false';
    const siteUrl = (env.VITE_PUBLIC_SITE_URL || 'https://www.aplusict.lk').replace(/\/$/, '');
    writeFileSync(resolve('dist/robots.txt'), production
      ? `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`
      : 'User-agent: *\nDisallow: /\n');
    writeFileSync(resolve('dist/sitemap.xml'), production
      ? `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteUrl}/</loc></url>\n  <url><loc>${siteUrl}/courses</loc></url>\n  <url><loc>${siteUrl}/resources</loc></url>\n  <url><loc>${siteUrl}/student-guide</loc></url>\n  <url><loc>${siteUrl}/about</loc></url>\n  <url><loc>${siteUrl}/contact</loc></url>\n</urlset>\n`
      : '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>\n');
    const indexPath = resolve('dist/index.html');
    writeFileSync(indexPath, readFileSync(indexPath, 'utf8').replace(
      'name="robots" content="noindex, nofollow"',
      `name="robots" content="${production ? 'index, follow' : 'noindex, nofollow'}"`
    ));
  }
});

export default defineConfig(({ mode }) => {
  const env = { ...process.env, VITE_APP_ENV: process.env.VITE_APP_ENV || mode };
  return {
  plugins: [react(), tailwindcss(), publicSeoFiles(env, mode)],
  server: { port: 5173 },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    globals: true
  }
};
});
