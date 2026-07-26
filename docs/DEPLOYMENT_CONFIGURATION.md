# Deployment configuration

The Docker build uses `npm ci` and `npm run build`, then serves `dist/` through Nginx. The Nginx configuration provides SPA fallback, immutable caching for hashed static assets, conservative security headers, and `/health`.

No `.env` file is copied to the runtime image. Vite API URL variables are public, non-secret build configuration only. Production deployment must provide compatible API host URLs and make the Auth refresh cookie's CORS, SameSite, Secure, domain, and path settings match the web origin.
