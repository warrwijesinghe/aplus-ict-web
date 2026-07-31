import { resourceClient } from './clients/resource.client.js';

const unwrap = (response) => response.data;
export const resourceApi = {
  publicContentUrl: (id) => `${resourceClient.defaults.baseURL}/api/v1/resources/${id}/content`,
  contentUrl: (id) => `${resourceClient.defaults.baseURL}/api/v1/resources/${id}/content`,
  content: (id) =>
    resourceClient
      .get('/api/v1/resources/' + id + '/content', { responseType: 'blob' })
      .then((response) => response.data),
  downloadUrl: (id) => `${resourceClient.defaults.baseURL}/api/v1/resources/${id}/download`,
  publicDownloads: (params, signal) =>
    resourceClient.get('/api/v1/public/downloads', { params, signal }).then(unwrap),
  publicDownloadUrl: (id) =>
    resourceClient.defaults.baseURL + '/api/v1/public/downloads/' + id + '/download',
  download: (id) =>
    resourceClient
      .get('/api/v1/public/downloads/' + id + '/download', { responseType: 'blob' })
      .then((response) => response.data)
};
