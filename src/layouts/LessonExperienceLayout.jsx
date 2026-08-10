import { Link, Outlet, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from '../auth/auth-context.jsx';
import { BrandLogo } from '../components/layout/BrandLogo.jsx';
import { learningApi } from '../api/learning.api.js';
import { queryKeys } from '../api/query-keys.js';
import { PublicLayout } from './PublicLayout.jsx';
import { StudentLayout } from './StudentLayout.jsx';

const useCourseLessons = (courseSlug, lessonSlug) =>
  useQuery({
    queryKey: queryKeys.learning.player(courseSlug),
    queryFn: ({ signal }) => learningApi.player(courseSlug, signal),
    enabled: Boolean(courseSlug && lessonSlug)
  });

const LmsLessonHeader = ({ lesson }) => {
  if (!lesson) return null;

  const activities = lesson.topics.flatMap((topic) => topic.activities);
  const completed = activities.filter(
    (activity) => activity.progress?.status === 'completed'
  ).length;
  const percentage = activities.length ? Math.round((completed / activities.length) * 100) : 0;

  return (
    <div className="lms-lesson-header">
      <div className="lms-lesson-title">
        <span>Lesson {String(lesson.lessonNumber).padStart(2, '0')}</span>
        <strong>{lesson.title}</strong>
      </div>
      <div className="lms-lesson-progress">
        <div
          aria-label={`${completed} of ${activities.length} activities complete`}
          className="lms-progress-ring"
          role="img"
          style={{ '--progress': `${percentage * 3.6}deg` }}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M8 3h8v3a4 4 0 0 1-8 0V3Zm0 2H5v1a4 4 0 0 0 3.35 3.95M16 5h3v1a4 4 0 0 1-3.35 3.95M12 10v5m-3 5h6m-3-5a3 3 0 0 1-3 3h6a3 3 0 0 1-3-3" />
          </svg>
        </div>
        <p>
          <span>Lesson journey</span>
          <strong>
            {completed} / {activities.length}
          </strong>
        </p>
      </div>
    </div>
  );
};

const LmsLessonSwitcher = ({ courseSlug, lesson, lessons, title }) => {
  const [switcherOpen, setSwitcherOpen] = useState(false);
  if (!lesson) return null;

  const closeSwitcher = () => setSwitcherOpen(false);
  return (
    <div className="lms-lesson-switcher">
      <button
        aria-controls="lesson-switcher-menu"
        aria-expanded={switcherOpen}
        aria-haspopup="dialog"
        onClick={() => setSwitcherOpen((open) => !open)}
        type="button"
      >
        Switch lesson <span aria-hidden="true">⌄</span>
      </button>
      {switcherOpen ? (
        <section
          aria-label="Quick lesson switcher"
          className="lms-switcher-menu"
          id="lesson-switcher-menu"
        >
          <header>
            <span>Current course</span>
            <strong>{title}</strong>
          </header>
          <nav aria-label="Course lessons">
            {lessons?.map((item) => (
              <Link
                aria-current={String(item.id) === String(lesson.id) ? 'page' : undefined}
                key={item.id}
                onClick={closeSwitcher}
                to={`/courses/${courseSlug}/lessons/${item.slug || item.id}`}
              >
                <span className="lms-switcher-number">
                  {String(item.lessonNumber).padStart(2, '0')}
                </span>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.progress?.progressPercent || 0}% complete</small>
                  <progress
                    aria-label={`${item.title} progress`}
                    max="100"
                    value={item.progress?.progressPercent || 0}
                  />
                </span>
              </Link>
            ))}
          </nav>
          <div className="lms-switcher-actions">
            <Link
              className="lms-switcher-all"
              onClick={closeSwitcher}
              to={`/courses/${courseSlug}/learn`}
            >
              All lessons in this course
            </Link>
            <Link className="lms-switcher-my-courses" onClick={closeSwitcher} to="/my-courses">
              All My Courses
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
};

// Lesson URLs are also used for public previews. Visitors retain the public
// site shell; students move into a focused LMS shell with lesson navigation.
const StudentLessonExperienceLayout = ({ courseSlug, lessonSlug }) => {
  const query = useCourseLessons(courseSlug, lessonSlug);
  const lesson = query.data?.lessons?.find(
    (item) => String(item.slug || item.id) === String(lessonSlug)
  );

  return (
    <main className="lms-shell">
      <header className="lms-topbar">
        <Link aria-label="A Plus ICT home" className="lms-brand" to="/">
          <BrandLogo variant="light" />
        </Link>
        <div className="lms-desktop-lesson-header">
          <LmsLessonHeader lesson={lesson} />
        </div>
        <nav aria-label="Learning navigation">
          <LmsLessonSwitcher
            courseSlug={courseSlug}
            lesson={lesson}
            lessons={query.data?.lessons}
            title={query.data?.course?.title}
          />
          <Link to="/">Home</Link>
        </nav>
      </header>
      <section className="lms-lesson-banner" aria-label="Current lesson">
        <LmsLessonHeader lesson={lesson} />
      </section>
      <Outlet />
    </main>
  );
};

export const LessonExperienceLayout = () => {
  const { user } = useAuth();
  const { courseSlug, lessonSlug } = useParams();
  const roles = user?.roles || [user?.role];

  // Course overviews belong in the student's My Learning portal. The compact
  // shell is reserved for an open lesson; visitors retain the public layout.
  if (!lessonSlug) return roles.includes('student') ? <StudentLayout /> : <PublicLayout />;

  return roles.includes('student') ? (
    <StudentLessonExperienceLayout courseSlug={courseSlug} lessonSlug={lessonSlug} />
  ) : (
    <PublicLayout />
  );
};
