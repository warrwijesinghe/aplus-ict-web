import { learningClient } from './clients/learning.client.js';
const data = (response) => response.data.data;
export const learningApi = {
  enrolments: (params, signal) =>
    learningClient.get('/api/v1/learning/me/enrolments', { params, signal }).then(data),
  enrolment: (id, signal) =>
    learningClient.get(`/api/v1/learning/me/enrolments/${id}`, { signal }).then(data),
  courseProgress: (id, signal) =>
    learningClient.get(`/api/v1/learning/me/courses/${id}/progress`, { signal }).then(data),
  access: (id, body) =>
    learningClient.post(`/api/v1/learning/me/lessons/${id}/access`, body).then(data),
  start: (id, body) =>
    learningClient.post(`/api/v1/learning/me/lessons/${id}/start`, body).then(data),
  updateProgress: (id, body) =>
    learningClient.patch(`/api/v1/learning/me/lessons/${id}/progress`, body).then(data),
  complete: (id, body) =>
    learningClient.post(`/api/v1/learning/me/lessons/${id}/complete`, body).then(data),
  adminEnrolments: (params, signal) =>
    learningClient.get('/api/v1/admin/learning/enrolments', { params, signal }).then(data)
};
