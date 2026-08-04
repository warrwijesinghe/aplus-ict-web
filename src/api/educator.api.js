import { serviceUrls } from './service-urls.js';
import { createClient } from './clients/create-client.js';
const client = createClient(serviceUrls.auth, 'educator');
const data = (response) => response.data.data;
export const educatorApi = {
  tracks: () => client.get('/api/v1/educator/tracks').then(data),
  track: (trackId) => client.get(`/api/v1/educator/tracks/${trackId}`).then(data)
};
