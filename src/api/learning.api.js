import { learningClient } from './clients/learning.client.js';
const data = (response) => response.data.data;
export const learningApi = {
  enrolments: (params, signal) =>
    learningClient.get('/api/v1/learning/continue', { params, signal }).then(data),
  enrolment: (id, signal) => learningClient.get(`/api/v1/learning/continue`, { signal }).then(data),
  courseProgress: (id, signal) =>
    learningClient.get(`/api/v1/learning/continue`, { signal }).then(data),
  access: (id, body) => learningClient.post(`/api/v1/lessons/${id}/access`, body).then(data),
  start: (id, body) =>
    learningClient.patch(`/api/v1/lessons/${id}/progress`, { ...body, percentage: 1 }).then(data),
  updateProgress: (id, body) =>
    learningClient.patch(`/api/v1/lessons/${id}/progress`, body).then(data),
  complete: (id, body) =>
    learningClient.patch(`/api/v1/lessons/${id}/progress`, { ...body, percentage: 100 }).then(data),
  activityProgress: (courseSlug, signal) =>
    learningClient
      .get(`/api/v1/learning/courses/${courseSlug}/activity-progress`, { signal })
      .then(data),
  completeActivity: (activityId) =>
    learningClient.post(`/api/v1/learning/activities/${activityId}/complete`).then(data),
  adminEnrolments: (params, signal) =>
    learningClient.get('/api/v1/admin/learning/enrolments', { params, signal }).then(data)
};
