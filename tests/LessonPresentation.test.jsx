import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, test, vi } from 'vitest';
import { useLessonPresentation } from '../src/features/student/lesson-presentation.js';

const mocks = vi.hoisted(() => ({ player: vi.fn(), publicLesson: vi.fn() }));
vi.mock('../src/api/learning.api.js', () => ({ learningApi: { player: mocks.player } }));
vi.mock('../src/api/content.api.js', () => ({ contentApi: { publicLesson: mocks.publicLesson } }));

test('reuses one course player query and reads lesson progress/access without guessing', async () => {
  const rows = [{ id: 'one', lessonId: 'one', courseSlug: 'ict', lessonSlug: 'one', canLearn: true }, { id: 'two', lessonId: 'two', courseSlug: 'ict', lessonSlug: 'two', canLearn: true }];
  mocks.player.mockResolvedValue({ lessons: [{ id: 'one', fullAccess: true, progress: { progressPercent: 25 }, topics: [{ activities: [{ id: 'completed', progress: { status: 'completed' } }, { id: 'next', progress: { status: 'not_started' }, isLocked: false }] }] }, { id: 'two', progress: { progressPercent: 0 }, topics: [] }] });
  mocks.publicLesson.mockResolvedValue({ data: { lesson: { premiumUnlocked: true } } });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  const { result, unmount } = renderHook(() => useLessonPresentation(rows), { wrapper });
  await waitFor(() => expect(result.current[0].fullAccess).toBe(true));
  expect(result.current[0].progress.progressPercent).toBe(25);
  expect(result.current[0].continueTo).toBe('/courses/ict/lessons/one/activities/next');
  expect(result.current[1].started).toBe(false);
  expect(mocks.player).toHaveBeenCalledOnce();
  unmount(); client.clear();
});
