import { serviceUrls } from '../service-urls.js';
import { createClient } from './create-client.js';
export const contentClient = createClient(serviceUrls.content, 'content');
