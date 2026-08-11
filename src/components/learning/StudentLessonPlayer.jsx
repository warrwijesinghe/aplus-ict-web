import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation, useParams } from 'react-router-dom';
import { CircleHelp, FileText, LockKeyhole, Video } from 'lucide-react';
import { learningApi } from '../../api/learning.api.js';
import { contentApi } from '../../api/content.api.js';
import { queryKeys } from '../../api/query-keys.js';
import { resourceApi } from '../../api/resource.api.js';
import { safeExternalUrl } from '../../utils/safe-url.js';
import { useAuth } from '../../auth/auth-context.jsx';
import { serviceUrls } from '../../api/service-urls.js';
import { EmptyState, InlineError, LoadingSkeleton } from '../common/States.jsx';
import { StudentQuiz } from './StudentQuiz.jsx';
import { LessonPrice } from '../pricing/LessonPrice.jsx';
import { academicAreaForCourse } from '../../config/lesson-pricing.js';

const typeNames = {
  label: 'Label',
  page: 'Page',
  rich_text: 'Study note',
  video: 'Video',
  image: 'Image',
  pdf: 'PDF',
  file: 'File',
  download: 'Download',
  external_link: 'External link',
  embed: 'Embed',
  practical_activity: 'Practical activity',
  assignment: 'Assignment',
  quiz: 'Quiz'
};
const ActivityTypeIcon = ({ type }) => {
  const Icon = type === 'video' ? Video : type === 'quiz' ? CircleHelp : FileText;
  return <Icon aria-hidden="true" />;
};
const playerPath = (courseSlug, target) =>
  target
    ? `/courses/${courseSlug}/lessons/${target.lessonSlug}/activities/${target.activityId}`
    : `/courses/${courseSlug}/learn`;

const youtubeEmbedUrl = (url) => {
  const safe = safeExternalUrl(url);
  if (!safe) return null;
  try {
    const parsed = new URL(safe);
    const id =
      parsed.hostname === 'youtu.be' ? parsed.pathname.slice(1) : parsed.searchParams.get('v');
    return id && /^[A-Za-z0-9_-]{11}$/.test(id)
      ? `https://www.youtube-nocookie.com/embed/${id}`
      : null;
  } catch {
    return null;
  }
};

const useSecureResource = (resourceId) => {
  const [state, setState] = useState({ url: '', error: '', pending: false });
  useEffect(
    () => () => {
      if (state.url) window.URL.revokeObjectURL(state.url);
    },
    [state.url]
  );
  const open = async (inline = true) => {
    if (!resourceId) return;
    setState({ url: '', error: '', pending: true });
    try {
      const blob = await resourceApi.content(resourceId);
      const url = window.URL.createObjectURL(blob);
      if (inline) window.open(url, '_blank', 'noopener,noreferrer');
      else {
        const link = document.createElement('a');
        link.href = url;
        link.download = '';
        link.click();
      }
      setState({ url, error: '', pending: false });
    } catch {
      setState({ url: '', error: 'This resource is currently unavailable.', pending: false });
    }
  };
  return { ...state, open };
};

const ResourceAction = ({ activity, download = false, label }) => {
  const resource = useSecureResource(activity.resourceId);
  if (!activity.resourceId) return <p>Resource unavailable.</p>;
  return (
    <div className="player-resource-action">
      <button onClick={() => resource.open(!download)} type="button" disabled={resource.pending}>
        {resource.pending
          ? 'Preparing resource…'
          : label || (download ? 'Download file' : 'Open resource')}
      </button>
      {resource.error ? <p role="alert">{resource.error}</p> : null}
    </div>
  );
};

const SecureImage = ({ resourceId, alt }) => {
  const [state, setState] = useState({ url: '', error: false });
  useEffect(() => {
    let active = true;
    let objectUrl = '';
    resourceApi
      .content(resourceId)
      .then((blob) => {
        objectUrl = window.URL.createObjectURL(blob);
        if (active) setState({ url: objectUrl, error: false });
      })
      .catch(() => {
        if (active) setState({ url: '', error: true });
      });
    return () => {
      active = false;
      if (objectUrl) window.URL.revokeObjectURL(objectUrl);
    };
  }, [resourceId]);
  if (state.error) return <p role="alert">Image unavailable.</p>;
  return state.url ? <img alt={alt || ''} src={state.url} /> : <p>Loading image…</p>;
};

const HtmlContent = ({ html }) =>
  html ? (
    <div className="player-rich-content" dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <p>Content is being prepared.</p>
  );
const LabelActivity = ({ activity }) => (
  <div className="player-label">
    <HtmlContent html={activity.content} />
  </div>
);
const VideoActivity = ({ activity }) => {
  const embed = youtubeEmbedUrl(activity.youtubeUrl);
  return embed ? (
    <>
      <div className="player-video">
        <iframe
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          src={embed}
          title={activity.title}
        />
      </div>
    </>
  ) : (
    <p role="status">This video is unavailable right now.</p>
  );
};
const ImageActivity = ({ activity }) =>
  activity.resourceId ? (
    <figure className="player-image">
      <SecureImage
        alt={activity.config?.altText || activity.title}
        resourceId={activity.resourceId}
      />
      {activity.config?.caption ? <figcaption>{activity.config.caption}</figcaption> : null}
    </figure>
  ) : (
    <p role="alert">Image unavailable.</p>
  );
const PdfActivity = ({ activity }) => <ResourceAction activity={activity} label="Open PDF" />;
const FileActivity = ({ activity, download }) => (
  <ResourceAction
    activity={activity}
    download={download}
    label={download ? 'Download file' : 'Open file'}
  />
);
const ExternalLinkActivity = ({ activity }) => {
  const url = safeExternalUrl(activity.externalUrl);
  return url ? (
    <a className="button" href={url} rel="noreferrer" target="_blank">
      Open external learning resource <span className="sr-only">in a new tab</span>
    </a>
  ) : (
    <p role="alert">This external resource is unavailable.</p>
  );
};
const PracticalActivity = ({ activity }) => (
  <div className="player-practical">
    <HtmlContent html={activity.instructions || activity.content} />
    {activity.config?.expectedOutput ? (
      <p>
        <strong>Expected outcome:</strong> {activity.config.expectedOutput}
      </p>
    ) : null}
    {activity.config?.requiredSoftware?.length ? (
      <p>
        <strong>Suggested software:</strong> {activity.config.requiredSoftware.join(', ')}
      </p>
    ) : null}
  </div>
);
const FutureActivity = ({ activity }) => (
  <div className="player-future">
    <p>{activity.instructions || activity.descriptionEn || 'This activity is being prepared.'}</p>
    <p>
      <strong>
        {activity.type === 'quiz'
          ? 'Quiz attempts are not available yet.'
          : 'Student submission is not available yet.'}
      </strong>
    </p>
  </div>
);
const QuizActivity = ({ activity }) =>
  activity.quizId ? (
    <StudentQuiz quizId={activity.quizId} />
  ) : (
    <p role="alert">This Quiz has not been configured yet.</p>
  );
const UnsupportedActivity = () => (
  <p role="status">This learning activity is not supported in the student player yet.</p>
);

const PremiumActivityLock = ({ activity, course }) => {
  const { courseSlug, lessonSlug } = useParams();
  const isSinhalaMedium = course?.medium?.code === 'sinhala' || course?.medium?.locale === 'si-LK';
  const state = activity.accessState || {};
  const hasPremiumRequirement = state.unmetRequirements?.some((item) => item.type === 'premium');
  const purchasePath = `/courses/${courseSlug}/lessons/${lessonSlug}/exam-success-pack`;

  if (!isSinhalaMedium)
    return (
      <section className="player-premium-lock" role="status">
        <span className="player-premium-lock-icon" aria-hidden="true">
          🔒
        </span>
        <p className="eyebrow">Premium lesson content</p>
        <h2>This activity is ready to unlock</h2>
        <p>Unlock this lesson to continue with its premium activities and learning resources.</p>
        {hasPremiumRequirement ? (
          <div className="player-premium-cta">
            <div>
              <strong>Unlock the full lesson</strong>
              <span>Review access details on the next page.</span>
            </div>
            <Link className="button" to={purchasePath}>
              Unlock full content
            </Link>
          </div>
        ) : (
          <p className="player-premium-note">
            {state.reasons?.[0] || 'Premium access is required for this activity.'}
          </p>
        )}
      </section>
    );

  return (
    <section className="player-premium-lock sinhala-medium" role="status">
      <span className="player-premium-lock-icon" aria-hidden="true">
        🔒
      </span>
      <p className="eyebrow">Premium පාඩම් කොටස</p>
      <h2>මෙම ඉගෙනුම් කොටස අගුළු දමා ඇත</h2>
      <p>මෙම activity එක සහ Lesson 01 හි premium learning resources ලබාගැනීමට පාඩම unlock කරන්න.</p>
      <ul className="player-premium-benefits">
        <li>මෙම පාඩමේ premium activities සහ resources වෙත ප්‍රවේශය</li>
        <li>ඔබගේ learning progress එක එකම තැනක සටහන් කරගෙන යාම</li>
      </ul>
      {hasPremiumRequirement ? (
        <div className="player-premium-cta">
          <div>
            <strong>Lesson 01 සම්පූර්ණයෙන් ඉගෙනගන්න</strong>
            <span>පාඩම unlock කර ඉදිරියට යන්න.</span>
          </div>
          <Link className="button" to={purchasePath}>
            පාඩම unlock කරන්න
          </Link>
        </div>
      ) : (
        <p className="player-premium-note">
          {state.reasons?.[0] || 'මෙම activity එක සඳහා premium access අවශ්‍යයි.'}
        </p>
      )}
    </section>
  );
};

export const ActivityRenderer = ({ activity, course }) => {
  if (activity.isLocked) return <PremiumActivityLock activity={activity} course={course} />;
  const renderers = {
    label: LabelActivity,
    page: ({ activity: item }) => <HtmlContent html={item.content} />,
    rich_text: ({ activity: item }) => <HtmlContent html={item.content} />,
    video: VideoActivity,
    image: ImageActivity,
    pdf: PdfActivity,
    file: FileActivity,
    download: ({ activity: item }) => <FileActivity activity={item} download />,
    external_link: ExternalLinkActivity,
    practical_activity: PracticalActivity,
    assignment: FutureActivity,
    quiz: QuizActivity,
    embed: UnsupportedActivity
  };
  const Renderer = renderers[activity.type] || UnsupportedActivity;
  return <Renderer activity={activity} />;
};

const ActivityLink = ({ activity, courseSlug, lessonSlug, current }) => (
  <Link
    aria-current={current ? 'page' : undefined}
    className={`player-nav-activity ${current ? 'current' : ''} ${activity.isLocked ? 'locked' : ''}`}
    to={playerPath(courseSlug, { lessonSlug, activityId: activity.id })}
  >
    <span className="player-nav-activity-copy">
      <span>{activity.title}</span>
      <small className="player-nav-activity-meta">
        <span
          aria-label={typeNames[activity.type] || 'Learning activity'}
          className="player-nav-type-icon"
          role="img"
        >
          <ActivityTypeIcon type={activity.type} />
        </span>
        {activity.isLocked
          ? activity.accessState?.reasons?.[0] || 'Locked'
          : typeNames[activity.type] || activity.type}
      </small>
    </span>
    {activity.isLocked ? (
      <span aria-label="Locked content" className="player-nav-lock" role="img">
        <LockKeyhole aria-hidden="true" />
      </span>
    ) : null}
  </Link>
);

const LessonJourney = ({ lesson }) => {
  const activities = lesson.topics
    .flatMap((topic) => topic.activities)
    .filter((activity) => !activity.isLocked);
  const completed = activities.filter(
    (activity) => activity.progress?.status === 'completed'
  ).length;
  const percentage = activities.length ? Math.round((completed / activities.length) * 100) : 0;
  return (
    <div className="course-map-journey">
      <div>
        <span>Lesson journey</span>
        <strong>
          {completed} / {activities.length}
        </strong>
      </div>
      <progress aria-label={`${lesson.title} progress`} max="100" value={percentage} />
      <p>Choose any available activity. Every completed activity moves this lesson forward.</p>
    </div>
  );
};

export const CourseMap = ({ courseSlug, lessons, currentId, lessonSlug, open, onClose }) => {
  const lesson =
    lessons.find((item) => String(item.slug || item.id) === String(lessonSlug)) ||
    lessons.find((item) =>
      item.topics.some((topic) => topic.activities.some((activity) => activity.id === currentId))
    );
  if (!lesson) return null;
  return (
    <CollapsibleCourseMap
      courseSlug={courseSlug}
      currentId={currentId}
      lesson={lesson}
      onClose={onClose}
      open={open}
    />
  );
  /*
  if (publicLesson?.unlockProduct && hasLockedPremiumActivity) return <aside className={`student-course-map ${open ? 'open' : ''}`} aria-label="Lesson navigation"><div className="course-map-heading"><div><strong>Lesson navigation</strong><span>Lesson {String(lesson.lessonNumber).padStart(2, '0')}</span></div><button aria-label="Close lesson navigation" onClick={onClose} type="button">×</button></div><Link className="course-map-back" to={`/courses/${courseSlug}/learn`}>← All lessons</Link><section className="course-map-lesson"><strong className="course-map-lesson-title">{lesson.title}</strong><LessonJourney lesson={lesson} />{lesson.topics.map((topic) => <div className="course-map-topic" key={topic.id}><strong>{topic.title}</strong>{topic.activities.map((activity) => <ActivityLink activity={activity} courseSlug={courseSlug} current={activity.id === currentId} key={activity.id} lessonSlug={lesson.slug || lesson.id} />)}</div>)}<div className="lms-unlock-card"><span>Premium පාඩම් කොටස</span><strong>පාඩම සම්පූර්ණයෙන් ඉගෙනගන්න</strong><p>Premium activities සහ resources ලබාගැනීමට මෙම පාඩම unlock කරන්න.</p><LessonPrice area={academicAreaForCourse(publicCourse)} course={publicCourse} product={publicLesson.unlockProduct} /><Link className="button" to={`/courses/${courseSlug}/lessons/${lesson.slug || lesson.id}/exam-success-pack`}>පාඩම unlock කරන්න</Link></div></section></aside>;
  return <aside className={`student-course-map ${open ? 'open' : ''}`} aria-label="Lesson navigation"><div className="course-map-heading"><div><strong>Lesson navigation</strong><span>Lesson {String(lesson.lessonNumber).padStart(2, '0')}</span></div><button aria-label="Close lesson navigation" onClick={onClose} type="button">×</button></div><Link className="course-map-back" to={`/courses/${courseSlug}/learn`}>← All lessons</Link><section className="course-map-lesson"><strong className="course-map-lesson-title">{lesson.title}</strong><LessonJourney lesson={lesson} />{lesson.topics.map((topic) => <div className="course-map-topic" key={topic.id}><strong>{topic.title}</strong>{topic.activities.map((activity) => <ActivityLink activity={activity} courseSlug={courseSlug} current={activity.id === currentId} key={activity.id} lessonSlug={lesson.slug || lesson.id} />)}</div>)}</section></aside>;
*/
};

const CourseMapActivity = ({
  activity,
  courseSlug,
  current,
  lessonSlug,
  onCompletionChange,
  pending
}) => {
  const isManual = activity.completionMode === 'manual' && !activity.isLocked;
  const isComplete = activity.progress?.status === 'completed';
  const status = isManual ? 'Mark this activity complete' : 'Completion is recorded automatically';
  return (
    <div className="course-map-activity-row">
      <input
        aria-label={`${status}: ${activity.title}`}
        checked={isComplete}
        disabled={!isManual || pending}
        onChange={(event) => onCompletionChange(activity, event.target.checked)}
        title={status}
        type="checkbox"
      />
      <ActivityLink
        activity={activity}
        courseSlug={courseSlug}
        current={current}
        lessonSlug={lessonSlug}
      />
    </div>
  );
};

const CollapsibleCourseMap = ({ courseSlug, currentId, lesson, onClose, open }) => {
  const [expandedTopics, setExpandedTopics] = useState({});
  const queryClient = useQueryClient();
  const completion = useMutation({
    mutationFn: ({ activity, completed }) =>
      learningApi.setManualCompletion(courseSlug, lesson.slug || lesson.id, activity.id, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.learning.player(courseSlug) });
      queryClient.invalidateQueries({ queryKey: queryKeys.learning.continue(courseSlug) });
      queryClient.invalidateQueries({ queryKey: queryKeys.learning.playerActivity(courseSlug) });
    }
  });
  const activeTopicId = lesson.topics.find((topic) =>
    topic.activities.some((activity) => String(activity.id) === String(currentId))
  )?.id;
  useEffect(() => {
    if (!activeTopicId) return;
    setExpandedTopics(
      Object.fromEntries(lesson.topics.map((topic) => [topic.id, topic.id === activeTopicId]))
    );
  }, [activeTopicId, lesson.topics]);
  const toggleTopic = (topicId) =>
    setExpandedTopics((current) => ({ ...current, [topicId]: !current[topicId] }));
  const markCompletion = (activity, completed) => {
    if (activity.completionMode === 'manual' && !activity.isLocked)
      completion.mutate({ activity, completed });
  };

  return (
    <aside className={`student-course-map ${open ? 'open' : ''}`} aria-label="Lesson navigation">
      <div className="course-map-heading">
        <div>
          <strong>Lesson navigation</strong>
          <span>Lesson {String(lesson.lessonNumber).padStart(2, '0')}</span>
        </div>
        {onClose ? (
          <button aria-label="Close lesson navigation" onClick={onClose} type="button">
            ×
          </button>
        ) : null}
      </div>
      <Link className="course-map-back" to={`/courses/${courseSlug}/learn`}>
        ← All lessons
      </Link>
      <section className="course-map-lesson">
        <strong className="course-map-lesson-title">{lesson.title}</strong>
        <LessonJourney lesson={lesson} />
        {lesson.topics.map((topic, index) => {
          const expanded = expandedTopics[topic.id] ?? index === 0;
          const completed = topic.activities.filter(
            (activity) => activity.progress?.status === 'completed'
          ).length;
          return (
            <section className="course-map-topic" key={topic.id}>
              <button
                aria-controls={`course-map-topic-${topic.id}`}
                aria-expanded={expanded}
                className="course-map-topic-toggle"
                onClick={() => toggleTopic(topic.id)}
                type="button"
              >
                <span>
                  <strong>{topic.title}</strong>
                  <small>
                    {completed} / {topic.activities.length} complete
                  </small>
                </span>
                <b aria-hidden="true">{expanded ? '⌃' : '⌄'}</b>
              </button>
              {expanded ? (
                <div id={`course-map-topic-${topic.id}`}>
                  {topic.activities.map((activity) => (
                    <CourseMapActivity
                      activity={activity}
                      courseSlug={courseSlug}
                      current={activity.id === currentId}
                      key={activity.id}
                      lessonSlug={lesson.slug || lesson.id}
                      onCompletionChange={markCompletion}
                      pending={completion.isPending}
                    />
                  ))}
                </div>
              ) : null}
            </section>
          );
        })}
      </section>
    </aside>
  );
};

// Keeps the same activity navigator available before a learner opens an
// individual activity. On smaller screens, the topic list remains the compact
// navigation option while the full map is shown within the activity player.
export const LessonActivityNavigator = ({ courseSlug, lessonSlug }) => {
  const { isAuthenticated } = useAuth();
  const course = useQuery({
    queryKey: queryKeys.learning.player(courseSlug),
    queryFn: ({ signal }) => learningApi.player(courseSlug, signal),
    enabled: isAuthenticated
  });

  if (!isAuthenticated || !course.data?.lessons) return null;
  return (
    <CourseMap
      courseSlug={courseSlug}
      lessonSlug={lessonSlug}
      lessons={course.data.lessons}
      open={false}
    />
  );
};

const EnrolledLessonCard = ({ course, courseSlug, lesson, publicLesson }) => {
  const activities = lesson.topics.flatMap((topic) => topic.activities);
  const progress = lesson.progress || {};
  const hasPaidContent = Boolean(
    publicLesson?.hasPaidContent ||
    activities.some((activity) => activity.accessPolicy === 'premium')
  );
  const premiumUnlocked =
    hasPaidContent &&
    !activities.some((activity) => activity.accessPolicy === 'premium' && activity.isLocked);
  const lessonPath = `/courses/${courseSlug}/lessons/${lesson.slug || lesson.id}`;
  const completed = progress.completedActivities || 0;
  const total = progress.totalAccessibleActivities || 0;

  return (
    <article className="enrolled-lesson-card">
      <header>
        <span className="enrolled-lesson-number">
          {String(lesson.lessonNumber).padStart(2, '0')}
        </span>
        <div>
          <p>Lesson {String(lesson.lessonNumber).padStart(2, '0')}</p>
          <h2>{lesson.title}</h2>
        </div>
        <span
          className={`enrolled-lesson-access ${premiumUnlocked ? 'unlocked' : hasPaidContent ? 'mixed' : 'free'}`}
        >
          {premiumUnlocked
            ? 'Full content unlocked'
            : hasPaidContent
              ? 'Free + locked content'
              : 'Free content'}
        </span>
      </header>
      {lesson.summary ? <p className="enrolled-lesson-summary">{lesson.summary}</p> : null}
      <div className="enrolled-lesson-progress">
        <div>
          <span>Your progress</span>
          <strong>{progress.progressPercent || 0}%</strong>
        </div>
        <progress
          aria-label={`${lesson.title} progress`}
          max="100"
          value={progress.progressPercent || 0}
        />
        <p>
          {completed} of {total} available activities complete
        </p>
      </div>
      <div className="enrolled-lesson-details">
        <span>
          {publicLesson?.freeContentCount ||
            activities.filter((activity) => activity.accessPolicy === 'free').length}{' '}
          free activities
        </span>
        {hasPaidContent ? (
          <span>
            {publicLesson?.paidContentCount ||
              activities.filter((activity) => activity.accessPolicy === 'premium').length}{' '}
            full lesson items
          </span>
        ) : null}
      </div>
      <div className="enrolled-lesson-actions">
        <Link className="button" to={lessonPath}>
          Open lesson
        </Link>
        {hasPaidContent && !premiumUnlocked ? (
          publicLesson?.unlockProduct ? (
            <div className="lesson-unlock-option">
              <LessonPrice
                area={academicAreaForCourse(course)}
                course={course}
                product={publicLesson.unlockProduct}
              />
              <Link
                className="lesson-unlock-action"
                to={`/courses/${courseSlug}/lessons/${lesson.slug || lesson.id}/exam-success-pack`}
              >
                Unlock full content
              </Link>
            </div>
          ) : (
            <p className="lesson-unlock-pending">Full lesson access will be available soon.</p>
          )
        ) : null}
      </div>
    </article>
  );
};

export const StudentCourseOverview = ({ courseSlug }) => {
  const course = useQuery({
    queryKey: queryKeys.learning.player(courseSlug),
    queryFn: ({ signal }) => learningApi.player(courseSlug, signal)
  });
  const continuation = useQuery({
    queryKey: queryKeys.learning.continue(courseSlug),
    queryFn: ({ signal }) => learningApi.continue(courseSlug, signal)
  });
  const curriculum = useQuery({
    queryKey: queryKeys.content.publicCurriculum(courseSlug),
    queryFn: ({ signal }) => contentApi.publicCurriculum(courseSlug, signal)
  });
  if (course.isPending) return <LoadingSkeleton label="Loading course" />;
  if (course.isError) return <InlineError error={course.error} onRetry={course.refetch} />;
  const data = course.data;
  const publicCourse = curriculum.data?.data;

  if (publicCourse) {
    const publicLessons = new Map(
      (publicCourse.lessons || []).map((lesson) => [String(lesson.slug || lesson.id), lesson])
    );
    return (
      <section className="enrolled-course-overview">
        <nav aria-label="Breadcrumb" className="breadcrumbs">
          <Link to="/my-courses">My courses</Link>
          <span>/</span>
          <span>{data.course.academicLevel?.name}</span>
          <span>/</span>
          <span>{data.course.medium?.name}</span>
        </nav>
        <header className="enrolled-course-header">
          <div>
            <p className="eyebrow">{data.course.medium?.name}</p>
            <h1>{data.course.title}</h1>
            <p>
              Choose any available lesson at any time. Each completed activity moves your course
              journey forward.
            </p>
          </div>
          <div className="enrolled-course-progress">
            <span>Your course journey</span>
            <strong>{data.progress.progressPercent}% complete</strong>
            <progress max="100" value={data.progress.progressPercent} />
            <small>Complete activities in the order that works for you.</small>
          </div>
          {continuation.data?.target ? (
            <Link className="button" to={playerPath(courseSlug, continuation.data.target)}>
              Continue this mission
            </Link>
          ) : null}
        </header>
        <section className="enrolled-lessons-section">
          <div className="enrolled-lessons-heading">
            <div>
              <p className="eyebrow">Course lessons</p>
              <h2>Choose your next lesson</h2>
            </div>
            <p>
              Every lesson is ready when you are. Free learning stays available, with full lesson
              access shown where it is published.
            </p>
          </div>
          {data.lessons.length ? (
            <div className="enrolled-lesson-grid">
              {data.lessons.map((lesson) => (
                <EnrolledLessonCard
                  course={publicCourse}
                  courseSlug={courseSlug}
                  key={lesson.id}
                  lesson={lesson}
                  publicLesson={publicLessons.get(String(lesson.slug || lesson.id))}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="Lessons for this course are being prepared" />
          )}
        </section>
      </section>
    );
  }
  return (
    <section className="student-course-overview">
      <nav aria-label="Breadcrumb" className="breadcrumbs">
        <Link to="/dashboard">My Courses</Link>
        <span>/</span>
        <span>{data.course.academicLevel?.name}</span>
        <span>/</span>
        <span>{data.course.medium?.name}</span>
      </nav>
      <header>
        <p className="eyebrow">{data.course.medium?.name}</p>
        <h1>{data.course.title}</h1>
        <div className="player-progress">
          <span>Course progress</span>
          <strong>{data.progress.progressPercent}% complete</strong>
          <progress max="100" value={data.progress.progressPercent} />
        </div>
        {continuation.data?.target ? (
          <Link className="button" to={playerPath(courseSlug, continuation.data.target)}>
            Continue Learning
          </Link>
        ) : null}
      </header>
      <div className="student-course-lessons">
        {data.lessons.length ? (
          data.lessons.map((lesson) => (
            <article key={lesson.id}>
              <div>
                <p className="eyebrow">Lesson {String(lesson.lessonNumber).padStart(2, '0')}</p>
                <h2>{lesson.title}</h2>
                {lesson.summary ? <p>{lesson.summary}</p> : null}
                <p>
                  {lesson.progress.progressPercent}% complete ·{' '}
                  {
                    lesson.topics
                      .flatMap((topic) => topic.activities)
                      .filter((activity) => activity.accessPolicy === 'free').length
                  }{' '}
                  free activities
                </p>
                <progress
                  aria-label={`${lesson.title} progress`}
                  max="100"
                  value={lesson.progress.progressPercent}
                />
              </div>
              <div>
                {lesson.topics.map((topic) => (
                  <section key={topic.id}>
                    <h3>{topic.title}</h3>
                    {topic.activities.map((activity) => (
                      <ActivityLink
                        activity={activity}
                        courseSlug={courseSlug}
                        key={activity.id}
                        lessonSlug={lesson.slug || lesson.id}
                      />
                    ))}
                  </section>
                ))}
              </div>
            </article>
          ))
        ) : (
          <EmptyState title="No learning activities are available in this course yet." />
        )}
      </div>
    </section>
  );
};

export const StudentActivityPlayer = () => {
  const { courseSlug, lessonSlug, activityId } = useParams();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [mapOpen, setMapOpen] = useState(false);
  const queryClient = useQueryClient();
  const detail = useQuery({
    queryKey: queryKeys.learning.playerActivity(courseSlug, lessonSlug, activityId),
    queryFn: ({ signal }) => learningApi.playerActivity(courseSlug, lessonSlug, activityId, signal),
    enabled: isAuthenticated
  });
  const completion = useMutation({
    mutationFn: (completed) =>
      learningApi.setManualCompletion(courseSlug, lessonSlug, activityId, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.learning.player(courseSlug) });
      queryClient.invalidateQueries({ queryKey: queryKeys.learning.continue(courseSlug) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.learning.playerActivity(courseSlug, lessonSlug, activityId)
      });
    }
  });
  const data = detail.data;
  const activity = data?.current;
  const activeTopic = data?.lessons
    ?.flatMap((lesson) => lesson.topics)
    .find((topic) => topic.activities.some((item) => item.id === activityId));
  const isManual = activity?.completionMode === 'manual' && !activity?.isLocked;
  const isComplete = activity?.progress?.status === 'completed';
  useEffect(() => {
    setMapOpen(false);
  }, [activityId]);
  if (!isAuthenticated)
    return (
      <section className="login-cta">
        <p className="eyebrow">Student sign in</p>
        <h1>Sign in to continue learning.</h1>
        <p>Google sign-in keeps your activity progress and next lesson safe.</p>
        <a
          className="button"
          href={`${serviceUrls.auth}/api/v1/auth/google?returnTo=${encodeURIComponent(location.pathname)}`}
        >
          Continue with Google
        </a>
      </section>
    );
  if (detail.isPending) return <LoadingSkeleton label="Loading activity" />;
  if (detail.isError) return <InlineError error={detail.error} onRetry={detail.refetch} />;
  return (
    <section className="student-player">
      <nav aria-label="Breadcrumb" className="breadcrumbs">
        <Link to="/dashboard">My Courses</Link>
        <span>/</span>
        <Link to={`/courses/${courseSlug}/learn`}>{data.course.title}</Link>
        <span>/</span>
        <span>{activity.title}</span>
      </nav>
      <header className="student-player-header">
        <div>
          <p className="eyebrow">{typeNames[activity.type] || 'Learning activity'}</p>
          <h1>{activity.title}</h1>
          <p>
            {data.course.medium?.name} · {data.progress.progressPercent}% course complete
          </p>
        </div>
        <button
          aria-controls="student-course-map"
          aria-expanded={mapOpen}
          onClick={() => setMapOpen(true)}
          type="button"
        >
          Lesson navigation
        </button>
      </header>
      <div className="student-player-layout">
        <div id="student-course-map">
          <CourseMap
            courseSlug={courseSlug}
            currentId={activityId}
            lessons={data.lessons}
            onClose={() => setMapOpen(false)}
            open={mapOpen}
          />
        </div>
        <main className="student-activity">
          <header className="student-activity-context">
            <p className="eyebrow">{activeTopic?.title || 'Lesson activity'}</p>
            <h1 className="student-activity-title">
              <span
                aria-label={typeNames[activity.type] || 'Learning activity'}
                className="student-activity-type-icon"
                role="img"
              >
                <ActivityTypeIcon type={activity.type} />
              </span>
              <span>{activity.title}</span>
            </h1>
          </header>
          <ActivityRenderer activity={activity} course={data.course} />
          {isManual ? (
            <div className="player-completion">
              <div>
                <button
                  className="player-mark-done"
                  disabled={completion.isPending}
                  onClick={() => completion.mutate(!isComplete)}
                  type="button"
                >
                  {isComplete ? 'Mark as not done' : 'Mark as Done'}
                </button>
              </div>
              {completion.error ? (
                <p role="alert">Unable to update completion. Please try again.</p>
              ) : null}
            </div>
          ) : null}
          <nav className="player-next-previous" aria-label="Activity navigation">
            {data.previous ? (
              <Link to={playerPath(courseSlug, data.previous)}>
                ← Previous <span className="sr-only">activity</span>
              </Link>
            ) : (
              <span />
            )}
            {data.next ? (
              <Link to={playerPath(courseSlug, data.next)}>
                Next <span className="sr-only">activity</span> →
              </Link>
            ) : (
              <Link to={`/courses/${courseSlug}/learn`}>Return to course</Link>
            )}
          </nav>
        </main>
      </div>
    </section>
  );
};
