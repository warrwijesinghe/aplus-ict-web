import { resourceClient } from './clients/resource.client.js';
export const resourceApi = {
  publicContentUrl: (id) =>
    `${resourceClient.defaults.baseURL}/api/v1/public/resources/${id}/content`,
  contentUrl: (id) => `${resourceClient.defaults.baseURL}/api/v1/resources/${id}/content`,
  downloadUrl: (id) => `${resourceClient.defaults.baseURL}/api/v1/resources/${id}/download`
};
