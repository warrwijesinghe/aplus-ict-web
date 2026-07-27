import { contentClient } from './clients/content.client.js';
const unwrap = (response) => response.data;
export const contentApi = {
  subjects: (params, signal) =>
    contentClient.get('/api/v1/catalog/subjects', { params, signal }).then(unwrap),
  courses: (params, signal) =>
    contentClient.get('/api/v1/catalog/courses', { params, signal }).then(unwrap),
  course: (slug, signal) =>
    contentClient.get(`/api/v1/catalog/courses/${slug}`, { signal }).then(unwrap),
  curriculum: (id, signal) =>
    contentClient.get(`/api/v1/catalog/courses/${id}/curriculum`, { signal }).then(unwrap),
  preview: (id, signal) =>
    contentClient.get(`/api/v1/catalog/lessons/${id}/preview`, { signal }).then(unwrap),
  publicCourses: (signal) => contentClient.get('/api/public/courses', { signal }).then(unwrap),
  publicCourse: (slug, signal) =>
    contentClient.get(`/api/public/courses/${slug}`, { signal }).then(unwrap),
  publicCurriculum: (slug, signal) =>
    contentClient.get(`/api/public/courses/${slug}/curriculum`, { signal }).then(unwrap),
  siteProfile: (signal) => contentClient.get('/api/public/site-profile', { signal }).then(unwrap),
  adminList: (type, params, signal) =>
    contentClient.get(`/api/v1/admin/content/${type}`, { params, signal }).then(unwrap)
};
