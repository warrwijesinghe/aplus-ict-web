import { serviceUrls } from '../service-urls.js';
import { createClient } from './create-client.js';
export const resourceClient = createClient(serviceUrls.resource, 'resource');
