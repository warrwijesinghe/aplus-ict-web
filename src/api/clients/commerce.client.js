import { serviceUrls } from '../service-urls.js';
import { createClient } from './create-client.js';
export const commerceClient = createClient(serviceUrls.commerce, 'commerce');
