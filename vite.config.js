import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { generatePublicSeo } from './scripts/generate-public-seo.mjs';

const publicSeoFiles = (env, mode) => ({
  name: 'public-seo-files',
  closeBundle() {
    generatePublicSeo({ env, mode });
  }
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
  plugins: [react(), tailwindcss(), publicSeoFiles(env, mode)],
  define: { __APLUS_BUILD_ENV__: JSON.stringify(env.VITE_APP_ENV || mode) },
  server: { port: 5173 },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    globals: true
  }
};
});
