import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { studentLearningApi } from './student-learning.js';

const keys = { profile: ['student', 'profile'], enrollments: ['student', 'enrollments'], enrollment: (id) => ['student', 'enrollment', id], dashboard: ['student', 'dashboard'], history: ['student', 'learning-history'], progress: (slug) => ['learning', 'activity-progress', slug] };
export const useStudentProfile = () => useQuery({ queryKey: keys.profile, queryFn: studentLearningApi.profile });
export const useStudentEnrollments = () => useQuery({ queryKey: keys.enrollments, queryFn: studentLearningApi.enrollments });
export const useCourseEnrollment = (courseId, enabled = true) => useQuery({ queryKey: keys.enrollment(courseId), queryFn: () => studentLearningApi.enrollment(courseId), enabled });
export const useUpdateStudentProfile = () => { const client = useQueryClient(); return useMutation({ mutationFn: studentLearningApi.saveProfile, onSuccess: () => client.invalidateQueries({ queryKey: keys.profile }) }); };
export const useEnrollInCourse = () => { const client = useQueryClient(); return useMutation({ mutationFn: studentLearningApi.enroll, onSuccess: () => client.invalidateQueries({ queryKey: ['student'] }) }); };
export const useStudentDashboard = () => useQuery({ queryKey: keys.dashboard, queryFn: studentLearningApi.dashboard });
export const useLearningHistory = () => useQuery({ queryKey: keys.history, queryFn: studentLearningApi.learningHistory });
export const useStudentActivityProgress = (courseSlug, enabled = true) => useQuery({ queryKey: keys.progress(courseSlug), queryFn: () => studentLearningApi.activityProgress(courseSlug), enabled: Boolean(courseSlug) && enabled });
export const useCompleteStudentActivity = (courseSlug) => { const client = useQueryClient(); return useMutation({ mutationFn: studentLearningApi.recordActivity, onSuccess: () => client.invalidateQueries({ queryKey: keys.progress(courseSlug) }) }); };
