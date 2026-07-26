import { serviceUrls } from '../service-urls.js';
import { createClient } from './create-client.js';
export const authClient = createClient(serviceUrls.auth, 'auth', { authCookie: true });
