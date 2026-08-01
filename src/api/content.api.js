import { contentClient } from './clients/content.client.js';
import { ApiError } from './api-error.js';
const unwrap = (response) => response.data;
const itemList = (response) => ({ data: { items: response.data.data } });
const inferredLevel = (course) => {
  if (course.academicLevel) return course.academicLevel;
  const grade = course.slug?.match(/^grade-(\d+)-ict-/)?.[1];
  if (grade)
    return { code: `GRADE_${grade}`, nameEn: `Grade ${grade}`, nameSi: `${grade} ශ්‍රේණිය` };
  if (course.slug?.startsWith('al-ict-'))
    return { code: 'AL', nameEn: 'Advanced Level', nameSi: 'උසස් පෙළ' };
  return null;
};
const normalizeCatalogueCourse = (course) => {
  const academicLevel = inferredLevel(course);
  const active = course.availabilityStatus === 'active' || academicLevel?.code === 'AL';
  return {
    ...course,
    academicLevel,
    availabilityStatus: course.availabilityStatus || (active ? 'active' : 'coming_soon'),
    isFeatured: course.isFeatured ?? academicLevel?.code === 'AL',
    isPublic: course.isPublic ?? true,
    enrolmentOpen: course.enrolmentOpen ?? active,
    titleEn: course.titleEn || course.title,
    shortDescriptionEn: course.shortDescriptionEn || course.shortDescription,
    medium: course.medium
      ? { ...course.medium, nameEn: course.medium.nameEn || course.medium.name }
      : course.medium,
  };
};
const publicCatalogue = (response) => ({
  ...response.data,
  data: (response.data.data || []).map(normalizeCatalogueCourse),
});
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
  publicCourses: (params = {}, signal) =>
    contentClient.get('/api/v1/public/courses', { params, signal }).then(publicCatalogue),
  publicCourse: (slug, signal) =>
    contentClient.get(`/api/v1/public/courses/${slug}`, { signal }).then(unwrap),
  publicCurriculum: (slug, signal) =>
    contentClient.get(`/api/v1/public/courses/${slug}/curriculum`, { signal }).then(unwrap),
  publicLesson: async (courseSlug, lessonSlug, signal) => {
    try {
      return await contentClient.get(`/api/v1/public/courses/${courseSlug}/lessons/${lessonSlug}`, { signal }).then(unwrap);
    } catch (error) {
      // Earlier public-content deployments expose lesson detail through the
      // published curriculum rather than a dedicated lesson endpoint.
      if (error?.status !== 404) throw error;
      const response = await contentApi.publicCurriculum(courseSlug, signal);
      const course = response.data;
      const source = (course?.lessons || []).find((lesson) => lesson.slug === lessonSlug || String(lesson.id) === lessonSlug);
      if (!source) throw new ApiError({ code: 'LESSON_NOT_FOUND', message: 'This lesson is not available.', status: 404, service: 'content' });
      const contentItems = (source.activities || []).map((activity) => ({
        ...activity,
        contentType: activity.contentType || activity.activityType,
        descriptionEn: activity.descriptionEn || activity.summary,
        isLocked: activity.isLocked ?? activity.accessType === 'paid'
      }));
      return { data: { course, lesson: { ...source, topics: [{ id: `${source.id}-content`, title: source.title, contentItems }] } } };
    }
  },
  siteProfile: (signal) => contentClient.get('/api/v1/site-profile', { signal }).then(unwrap),
  adminList: (type, params, signal) =>
    contentClient.get(`/api/v1/admin/${type}`, { params, signal }).then(unwrap),
  // The admin editor deliberately uses the same small CRUD contract for
  // lessons, content sections, and their lesson-level unlock products.
  adminCreate: (type, body) => contentClient.post(`/api/v1/admin/${type}`, body).then(unwrap),
  adminUpdate: (type, id, body) =>
    contentClient.patch(`/api/v1/admin/${type}/${id}`, body).then(unwrap)
};
