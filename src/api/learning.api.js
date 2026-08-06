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
  player: (courseSlug, signal) => learningClient.get(`/api/v1/learning/courses/${courseSlug}/player`, { signal }).then(data),
  continue: (courseSlug, signal) => learningClient.get(`/api/v1/learning/courses/${courseSlug}/continue`, { signal }).then(data),
  playerActivity: (courseSlug, lessonSlug, activityId, signal) => learningClient.get(`/api/v1/learning/courses/${courseSlug}/lessons/${lessonSlug}/activities/${activityId}`, { signal }).then(data),
  setManualCompletion: (courseSlug, lessonSlug, activityId, completed) => learningClient.patch(`/api/v1/learning/courses/${courseSlug}/lessons/${lessonSlug}/activities/${activityId}/completion`, { completed }).then(data),
  quiz: (quizId, signal) => learningClient.get(`/api/v1/student/quizzes/${quizId}`, { signal }).then(data),
  startQuizAttempt: (quizId) => learningClient.post(`/api/v1/student/quizzes/${quizId}/attempts`).then(data),
  quizAttempt: (attemptId, signal) => learningClient.get(`/api/v1/student/quiz-attempts/${attemptId}`, { signal }).then(data),
  saveQuizAnswer: (attemptId, questionId, answer) => learningClient.put(`/api/v1/student/quiz-attempts/${attemptId}/answers/${questionId}`, answer).then(data),
  submitQuizAttempt: (attemptId) => learningClient.post(`/api/v1/student/quiz-attempts/${attemptId}/submit`).then(data),
  quizResult: (attemptId, signal) => learningClient.get(`/api/v1/student/quiz-attempts/${attemptId}/result`, { signal }).then(data),
  adminEnrolments: (params, signal) =>
    learningClient.get('/api/v1/admin/learning/enrolments', { params, signal }).then(data)
};
