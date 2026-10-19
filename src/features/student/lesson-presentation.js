import { useQueries } from '@tanstack/react-query';
import { learningApi } from '../../api/learning.api.js';

import { queryKeys } from '../../api/query-keys.js';

// Reuse the player map and existing enrolment/entitlement response; do not invent progress or
// infer purchases from course membership. Missing data stays visibly unknown.
export const useLessonPresentation = (enrollments = []) => {
  const slugs = [...new Set(enrollments.filter((item) => item.canLearn).map((item) => item.courseSlug))];
  const players = useQueries({ queries: slugs.map((slug) => ({ queryKey: queryKeys.learning.player(slug), queryFn: ({ signal }) => learningApi.player(slug, signal), staleTime: 30_000 })) });
  return enrollments.map((item) => {
    const player = players[slugs.indexOf(item.courseSlug)];
    const lesson = player?.data?.lessons?.find((entry) => entry.id === item.lessonId);
    const activities = lesson?.topics?.flatMap((topic) => topic.activities) || [];
    const started = activities.some((activity) => activity.progress?.status && activity.progress.status !== 'not_started');
    const next = activities.find((activity) => !activity.isLocked && activity.progress?.status !== 'completed') || activities.find((activity) => !activity.isLocked);
    const fullAccess = lesson?.fullAccess ?? item.fullAccess;
    return { ...item, progress: lesson?.progress || null, started, fullAccess: typeof fullAccess === 'boolean' ? fullAccess : null,
      continueTo: next ? `/courses/${item.courseSlug}/lessons/${item.lessonSlug}/activities/${next.id}` : `/courses/${item.courseSlug}/lessons/${item.lessonSlug}/learn`,
      progressError: Boolean(player?.isError), retryProgress: player?.refetch };
  });
};
