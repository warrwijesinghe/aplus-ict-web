import { serviceUrls } from '../service-urls.js';
import { createClient } from './create-client.js';
export const learningClient = createClient(serviceUrls.learning, 'learning');
