import { learningClient } from '../../api/clients/learning.client.js';

const unwrap = (response) => response.data.data;

// Student information and enrollments must follow the learner between devices.
// This adapter deliberately has no browser-storage fallback.
export const studentLearningApi = {
  profile: () => learningClient.get('/api/v1/student/profile').then(unwrap),
  saveProfile: (profile) => learningClient.patch('/api/v1/student/profile', profile).then(unwrap),
  enrollments: () => learningClient.get('/api/v1/student/enrollments').then(unwrap),
  enrollment: (courseId) => learningClient.get(`/api/v1/courses/${courseId}/enrollment`).then(unwrap),
  enroll: (course) => learningClient.post(`/api/v1/courses/${course.id}/enroll`).then(unwrap),
  activityProgress: (courseSlug) =>
    learningClient.get(`/api/v1/learning/courses/${courseSlug}/activity-progress`).then(unwrap),
  recordActivity: (activityId) =>
    learningClient.post(`/api/v1/learning/activities/${activityId}/complete`).then(unwrap),
};

export const isProfileComplete = (profile) => Boolean(
  profile?.fullName && profile?.mobileNumber && profile?.whatsAppNumber &&
  profile?.examYear && profile?.schoolName && profile?.district && profile?.preferredMedium
);
