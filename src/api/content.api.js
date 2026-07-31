import { contentClient } from './clients/content.client.js';
const unwrap = (response) => response.data;
const itemList = (response) => ({ data: { items: response.data.data } });
export const contentApi = {
  subjects: (params, signal) =>
    contentClient.get('/api/v1/categories', { params, signal }).then(itemList),
  courses: (params, signal) =>
    contentClient.get('/api/v1/courses', { params, signal }).then(itemList),
  course: (slug, signal) => contentClient.get(`/api/v1/courses/${slug}`, { signal }).then(unwrap),
  curriculum: (id, signal) =>
    contentClient.get(`/api/v1/courses/${id}/curriculum`, { signal }).then(unwrap),
  preview: (id, signal) =>
    contentClient.get(`/api/v1/catalog/lessons/${id}/preview`, { signal }).then(unwrap),
  publicCourses: (signal) => contentClient.get('/api/v1/public/courses', { signal }).then(unwrap),
  publicCourse: (slug, signal) =>
    contentClient.get(`/api/v1/public/courses/${slug}`, { signal }).then(unwrap),
  publicCurriculum: (slug, signal) =>
    contentClient.get(`/api/v1/public/courses/${slug}/curriculum`, { signal }).then(unwrap),
  siteProfile: (signal) => contentClient.get('/api/v1/site-profile', { signal }).then(unwrap),
  adminList: (type, params, signal) =>
    contentClient.get(`/api/v1/admin/${type}`, { params, signal }).then(unwrap),
  // The admin editor deliberately uses the same small CRUD contract for
  // lessons, content sections, and their lesson-level unlock products.
  adminCreate: (type, body) => contentClient.post(`/api/v1/admin/${type}`, body).then(unwrap),
  adminUpdate: (type, id, body) =>
    contentClient.patch(`/api/v1/admin/${type}/${id}`, body).then(unwrap)
};
