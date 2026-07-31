import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { contentApi } from '../api/content.api.js';
import { learningApi } from '../api/learning.api.js';
import { resourceApi } from '../api/resource.api.js';
import { serviceUrls } from '../api/service-urls.js';
import { queryKeys } from '../api/query-keys.js';
import { EmptyState, InlineError, LoadingSkeleton } from '../components/common/States.jsx';
import { ResourceImage } from '../components/resources/ResourceImage.jsx';
import { useAuth } from '../auth/auth-context.jsx';
import { useOrderSelection } from '../features/store/selection-context.jsx';
import { usePageSeo } from '../seo/use-page-seo.js';
import { safeExternalUrl } from '../utils/safe-url.js';
import { useCourseEnrollment } from '../features/student/hooks.js';

const freeContentTotal = (course) =>
  Number(course.freeContentCount ?? course.freeActivityCount ?? 0);

const paidContentTotal = (course) =>
  Number(course.paidContentCount ?? course.paidActivityCount ?? 0);

const counts = (course) => {
  const freeContent = freeContentTotal(course);
  const paidContent = paidContentTotal(course);
  const hasContent = freeContent + paidContent > 0;

  return (
    <p className="course-counts">
      <span>{course.syllabusLessonCount || 0} lessons</span>
      {hasContent ? (
        <>
          <span>{freeContent} free content</span>
          {paidContent ? <span>{paidContent} premium content</span> : null}
        </>
      ) : (
        <span>Content quests are coming soon</span>
      )}
    </p>
  );
};

// Course cards use local imagery while the catalogue is being populated. The default
// keeps future courses presentable until an admin assigns API-managed resource metadata.
const courseCardImage = (course) => {
  if (course.medium?.code === 'sinhala') return '/images/al-ict-sinhala.jfif';
  if (course.medium?.code === 'english') return '/images/al-ict-english.jpg';
  return '/images/course-card-default.jpg';
};

// Course descriptions can be filled in from the admin catalogue later. This
// fallback prevents empty cards while the initial syllabus content is prepared.
const courseDescription = (course) =>
  course.shortDescription ||
  course.description ||
  'Follow a structured lesson path, begin with free content, and build your A/L ICT confidence.';

// Reuse the supplied learning imagery as lightweight lesson covers. The number
// determines the image, so both Sinhala and English tracks stay visually aligned.
const lessonImages = [
  '/images/learning-hero.jpg',
  '/images/al-ict-english.jpg',
  '/images/course-card-default.jpg',
  '/images/ict-practice.jpg',
  '/images/study-cta.jpg',
  '/images/al-ict-sinhala.jfif'
];

const lessonImage = (lessonNumber) => lessonImages[(lessonNumber - 1) % lessonImages.length];

const LessonImage = ({ lesson }) => (
  <img
    alt={'Lesson ' + lesson.lessonNumber + ': ' + lesson.title}
    className="lesson-card-image"
    loading="lazy"
    src={lessonImage(lesson.lessonNumber)}
  />
);

const lessonProgress = (lesson) => {
  if (lesson.progress) return lesson.progress;

  const accessibleActivities = (lesson.activities || []).filter((activity) => !activity.isLocked);
  const completedActivities = accessibleActivities.filter(
    (activity) => activity.progress?.status === 'completed'
  ).length;

  return {
    completedActivities,
    totalAccessibleActivities: accessibleActivities.length,
    progressPercent: accessibleActivities.length
      ? Math.round((completedActivities / accessibleActivities.length) * 100)
      : 0
  };
};

const lessonAvailability = (lesson) => {
  const freeContent = Number(lesson.freeContentCount || 0);
  const paidContent = Number(lesson.paidContentCount || 0);

  if (!freeContent && !paidContent)
    return { className: 'coming', label: 'Content quests coming soon' };
  if (freeContent && paidContent)
    return { className: 'mixed', label: 'Free content + premium vault' };
  if (freeContent) return { className: 'free', label: 'Free content available' };
  return { className: 'paid', label: 'Premium content' };
};

const contentTypeLabel = {
  activity: 'Activity',
  download: 'Download',
  embed: 'Interactive lesson',
  image: 'Visual guide',
  note: 'Study note',
  pdf: 'PDF note',
  quiz: 'Quiz',
  rich_text: 'Study note',
  video: 'Video lesson'
};

const ActivityStudyContent = ({ activity }) => {
  const [fileError, setFileError] = useState('');
  const [isOpeningFile, setIsOpeningFile] = useState(false);
  const videoUrl = safeExternalUrl(activity.youtubeUrl);

  const openAttachedResource = async () => {
    setFileError('');
    setIsOpeningFile(true);

    try {
      const file = await resourceApi.content(activity.resourceId);
      const url = window.URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noreferrer';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(url), 30_000);
    } catch (error) {
      setFileError(error.message || 'The attached resource could not be opened.');
    } finally {
      setIsOpeningFile(false);
    }
  };

  return (
    <div className="activity-study-content">
      {activity.content ? <p>{activity.content}</p> : null}
      {videoUrl ? (
        <a className="activity-open-link" href={videoUrl} rel="noreferrer" target="_blank">
          Open video lesson
        </a>
      ) : null}
      {activity.resourceId ? (
        <button disabled={isOpeningFile} onClick={openAttachedResource} type="button">
          {isOpeningFile ? 'Opening resource...' : 'Open attached resource'}
        </button>
      ) : null}
      {!activity.content && !videoUrl && !activity.resourceId ? (
        <p>Study material will appear here when this quest is published.</p>
      ) : null}
      {fileError ? <p className="activity-study-error">{fileError}</p> : null}
    </div>
  );
};

const SyllabusLessonCard = ({ courseSlug, isEnrolled, lesson, progress }) => {
  const availability = lessonAvailability(lesson);
  const lessonStats = lessonProgress({ ...lesson, progress });

  return (
    <article className="syllabus-lesson-card">
      <div className="lesson-card-image-frame">
        <LessonImage lesson={lesson} />
      </div>
      <div className="lesson-card-content">
        <div className="lesson-card-meta">
          <span>Lesson {String(lesson.lessonNumber).padStart(2, '0')}</span>
          {lesson.estimatedPeriods ? <span>{lesson.estimatedPeriods} periods</span> : null}
        </div>
        <h3>{lesson.title}</h3>
        {lesson.shortDescription ? <p>{lesson.shortDescription}</p> : null}
        <div className="lesson-content-counts">
          {lesson.freeContentCount ? <span>{lesson.freeContentCount} free</span> : null}
          {lesson.paidContentCount ? <span>{lesson.paidContentCount} premium</span> : null}
        </div>
        <span className={'lesson-access ' + availability.className}>{availability.label}</span>
        {isEnrolled ? (
          <div className="card-progress">
            <div>
              <span>Your progress</span>
              <strong>{lessonStats.progressPercent}%</strong>
            </div>
            <progress max="100" value={lessonStats.progressPercent} />
          </div>
        ) : null}
        <Link className="lesson-card-link" to={`/courses/${courseSlug}/lessons/${lesson.id}`}>
          {isEnrolled ? 'Start lesson' : 'Preview lesson'}
        </Link>
      </div>
    </article>
  );
};

const CourseCard = ({ course }) => {
  const { isAuthenticated } = useAuth();
  const enrollment = useCourseEnrollment(course.id, isAuthenticated);
  const progress = useQuery({
    queryKey: queryKeys.learning.activityProgress(course.slug),
    queryFn: ({ signal }) => learningApi.activityProgress(course.slug, signal),
    enabled: isAuthenticated && Boolean(enrollment.data)
  });
  const courseProgress = progress.data;

  return (
    <article className="public-course-card">
      <div className="course-image-frame">
        <img
          alt={`${course.title} course cover`}
          className="course-image"
          loading="lazy"
          src={courseCardImage(course)}
        />
      </div>
      <div className="course-card-content">
        <p className="eyebrow">{course.medium?.name || course.medium?.code}</p>
        <h2>{course.title}</h2>
        <p>{courseDescription(course)}</p>
        {counts(course)}
        {enrollment.data ? (
          <div className="card-progress course-card-progress">
            <div>
              <span>Your course progress</span>
              <strong>{courseProgress?.progressPercent || 0}%</strong>
            </div>
            <progress max="100" value={courseProgress?.progressPercent || 0} />
            <p>
              {courseProgress?.completedAccessibleActivities || 0} of{' '}
              {courseProgress?.totalAccessibleActivities || 0} accessible quests complete
            </p>
          </div>
        ) : null}
        <Link className="button" to={enrollment.data ? `/courses/${course.slug}/learn` : `/courses/${course.slug}`}>
          {enrollment.data ? 'Continue Learning' : 'View Course'}
        </Link>
        {!isAuthenticated ? <Link className="button secondary" to={`/enroll/${course.slug}`}>Login to Enroll</Link> : !enrollment.data ? <Link className="button secondary" to={`/enroll/${course.slug}`}>Enroll Free</Link> : null}
      </div>
    </article>
  );
};

const CourseGrid = () => {
  const query = useQuery({
    queryKey: queryKeys.content.publicCourses,
    queryFn: ({ signal }) => contentApi.publicCourses(signal)
  });
  if (query.isLoading) return <LoadingSkeleton />;
  if (query.isError) return <InlineError error={query.error} />;
  const items = query.data?.data || [];
  return items.length ? (
    <div className="public-course-grid">
      {items.map((course) => (
        <CourseCard course={course} key={course.id} />
      ))}
    </div>
  ) : (
    <EmptyState title="Courses are not available right now" />
  );
};

const SocialLinks = ({ links = [] }) => {
  if (!links.length) return null;
  return (
    <section className="home-section social-section">
      <p className="eyebrow">Stay connected</p>
      <h2>Follow A Plus ICT</h2>
      <div className="social-pills">
        {links.map((item) => (
          <a href={item.url} key={item.id} rel="noreferrer" target="_blank">
            {item.label || item.platform}
          </a>
        ))}
      </div>
    </section>
  );
};

export const PublicHomePage = () => {
  usePageSeo({
    title: 'A/L ICT Lessons and Free Learning Resources',
    description:
      'Learn A/L ICT with structured Sinhala and English Medium lessons, free study resources, and clear progress tracking.',
    path: '/',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: 'A Plus ICT',
      description:
        'A Sri Lankan A/L ICT learning platform with structured courses and free learning resources.'
    }
  });
  const profile = useQuery({
    queryKey: queryKeys.content.siteProfile,
    queryFn: ({ signal }) => contentApi.siteProfile(signal),
    retry: false
  });
  const data = profile.data?.data;
  return (
    <>
      <section className="hero al-ict-hero">
        {data?.bannerResourceId ? (
          <ResourceImage
            alt="A Plus ICT students learning"
            className="hero-image"
            loading="eager"
            resourceId={data.bannerResourceId}
          />
        ) : (
          <img
            alt="Student learning online"
            className="hero-image"
            loading="eager"
            src="/images/learning-hero.jpg"
          />
        )}
        <div className="hero-copy">
          <p className="eyebrow">A Plus ICT</p>
          <h1>Learn A/L ICT with clarity, structure, and confidence.</h1>
          <p>
            Free lessons, guided learning activities, and progress tracking in one focused learning
            space.
          </p>
          <p className="hero-actions">
            <Link className="button" to="/courses">
              Start Learning Free
            </Link>
            <Link className="button secondary" to="/resources">
              Browse Free Resources
            </Link>
          </p>
        </div>
      </section>
      <section className="home-section featured-courses">
        <p className="eyebrow">A/L ICT courses</p>
        <h2>Choose your learning medium</h2>
        <p className="section-intro">
          Select a published course to see its syllabus, free activities, and learning path.
        </p>
        <CourseGrid />
      </section>
      <section className="home-section learning-highlight" id="how-it-works">
        <p className="eyebrow">How learning works</p>
        <h2>Simple steps. Meaningful progress.</h2>
        <div className="steps-grid">
          <article>
            <span>01</span>
            <h3>Select a course</h3>
            <p>Choose the A/L ICT medium that suits you.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Start with free lessons</h3>
            <p>Open available activities and build your knowledge.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Track your progress</h3>
            <p>Your completed free activities stay visible in My Learning.</p>
          </article>
        </div>
      </section>
      <section className="home-section benefits-section">
        <p className="eyebrow">Why A Plus ICT</p>
        <h2>Built for steady, independent learning.</h2>
        <div className="benefits-grid">
          <article>
            <h3>Clear syllabus path</h3>
            <p>Move through ordered lessons without losing your place.</p>
          </article>
          <article>
            <h3>Free first steps</h3>
            <p>Start learning before deciding whether you need additional access.</p>
          </article>
          <article>
            <h3>Progress that makes sense</h3>
            <p>Locked activities never reduce your free-learning progress.</p>
          </article>
        </div>
      </section>
      <section className="home-section guide-preview">
        <img
          alt="Students practising ICT skills together"
          className="guide-image"
          loading="lazy"
          src="/images/ict-practice.jpg"
        />
        <div>
          <p className="eyebrow">Student guide</p>
          <h2>New to the learning flow?</h2>
          <p>Learn how sign-in, free activities, and learning progress work before you begin.</p>
        </div>
        <Link className="text-link" to="/student-guide">
          Read the student guide <span aria-hidden="true">→</span>
        </Link>
      </section>
      <section className="home-section tutor-preview">
        <div className="tutor-image-frame">
          <img
            alt={data?.tutorName || 'A Plus ICT tutor'}
            className="tutor-image"
            src="/images/aplus-ict-tutor.png"
          />
        </div>
        <div>
          <p className="eyebrow">Meet your tutor</p>
          <h2>{data?.tutorName || 'A Plus ICT tutor'}</h2>
          <p>{data?.tutorTitle || 'Focused guidance for your A/L ICT learning journey.'}</p>
          <p>
            {data?.tutorBio ||
              'Build a clear foundation, practise consistently, and move through every lesson with confidence.'}
          </p>
          <Link className="text-link" to="/about">
            About A Plus ICT <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
      <SocialLinks links={data?.socialLinks} />
      <section className="login-cta">
        <p className="eyebrow">Ready when you are</p>
        <h2>Start your A/L ICT learning path today.</h2>
        <Link className="button" to="/courses">
          Start Learning Free
        </Link>
      </section>
    </>
  );
};

export const PublicCoursesPage = () => {
  usePageSeo({
    title: 'A/L ICT Courses in Sinhala and English Medium',
    description:
      'Browse A Plus ICT A/L ICT courses in Sinhala Medium and English Medium, each with a structured 13-lesson syllabus.',
    path: '/courses'
  });

  return (
    <>
      <section className="track-heading">
        <p className="eyebrow">Courses</p>
        <h1>A/L ICT learning paths</h1>
        <p>
          Choose Sinhala Medium or English Medium, begin with a free activity, and move through the
          syllabus at your own pace.
        </p>
        <Link className="text-link" to="/resources">
          Looking for syllabus documents or teachers guides? Browse resources
        </Link>
      </section>
      <CourseGrid />
    </>
  );
};

export const PublicCourseDetailPage = () => {
  const { courseSlug } = useParams();
  const { isAuthenticated } = useAuth();
  const query = useQuery({
    queryKey: queryKeys.content.publicCourse(courseSlug),
    queryFn: ({ signal }) => contentApi.publicCourse(courseSlug, signal)
  });
  const curriculum = useQuery({
    queryKey: queryKeys.content.publicCurriculum(courseSlug),
    queryFn: ({ signal }) => contentApi.publicCurriculum(courseSlug, signal)
  });
  const learningProgress = useQuery({
    queryKey: queryKeys.learning.activityProgress(courseSlug),
    queryFn: ({ signal }) => learningApi.activityProgress(courseSlug, signal),
    enabled: false
  });
  const enrollment = useCourseEnrollment(query.data?.data?.id, isAuthenticated && Boolean(query.data?.data?.id));
  const course = query.data?.data;
  usePageSeo({
    title: course?.title || 'A/L ICT Course',
    description: course ? courseDescription(course) : 'Explore a structured A/L ICT learning path.',
    path: '/courses/' + courseSlug,
    structuredData: course
      ? {
          '@context': 'https://schema.org',
          '@type': 'Course',
          name: course.title,
          description: courseDescription(course),
          provider: {
            '@type': 'Organization',
            name: 'A Plus ICT'
          },
          inLanguage: course.medium?.locale || 'en-LK'
        }
      : null
  });
  if (query.isLoading || curriculum.isLoading || enrollment.isLoading)
    return <LoadingSkeleton />;
  if (query.isError || curriculum.isError) return <InlineError error={query.error || curriculum.error} />;
  const lessons = curriculum.data?.data?.lessons || [];
  const progressByLesson = new Map(
    (learningProgress.data?.lessons || []).map((lesson) => [lesson.id, lesson.progress])
  );
  return (
    <>
      <section className="course-detail-hero">
        <div className="course-hero-image-frame">
          {course.heroResourceId ? (
            <ResourceImage
              alt={`${course.title} course hero`}
              className="course-hero-image"
              resourceId={course.heroResourceId}
            />
          ) : (
            <img
              alt={`${course.title} course cover`}
              className="course-hero-image"
              src={courseCardImage(course)}
            />
          )}
        </div>
        <div>
          <p className="eyebrow">{course.medium?.name || course.medium?.code}</p>
          <h1>{course.title}</h1>
          <p className="course-detail-description">{courseDescription(course)}</p>
          {counts(course)}
          <p className="course-detail-note">
            Explore free content first. Your progress expands as you unlock premium lesson content.
          </p>
          <div className="course-detail-actions">
            <Link className="button" to={enrollment.data ? `/courses/${course.slug}/learn` : `/enroll/${course.slug}`}>
              {enrollment.data ? 'Continue Learning' : isAuthenticated ? 'Enroll Free' : 'Login to Enroll'}
            </Link>
            <Link className="button secondary" to="/resources">
              Browse Free Resources
            </Link>
          </div>
        </div>
      </section>
      <section className="syllabus-summary">
        <p className="eyebrow">Syllabus overview</p>
        <h2>Explore the 13-lesson learning path</h2>
        <p className="syllabus-intro">
          Each lesson follows the official A/L ICT topic order. Start with open content, complete
          quests, and unlock premium lesson content whenever you are ready.
        </p>
        {lessons.length ? (
          <div className="syllabus-lesson-grid">
            {lessons.map((lesson) => (
              <SyllabusLessonCard
                courseSlug={courseSlug}
                key={lesson.id}
                lesson={lesson}
              isEnrolled={Boolean(enrollment.data)} progress={progressByLesson.get(lesson.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="Syllabus lessons will be published soon" />
        )}
      </section>
    </>
  );
};

const ActivityRow = ({ activity, courseSlug }) => {
  const [isOpen, setIsOpen] = useState(false);
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => learningApi.completeActivity(activity.id, { courseSlug }),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.learning.activityProgress(courseSlug) })
  });
  const status = activity.progress?.status || 'not_started';
  const hasStudyMaterial = Boolean(activity.content || activity.youtubeUrl || activity.resourceId);
  return (
    <li
      className={`lms-activity ${activity.isLocked ? 'locked' : ''} ${status === 'completed' ? 'completed' : ''}`}
    >
      <span>{String(activity.displayOrder).padStart(2, '0')}</span>
      <div>
        <p className="activity-type-label">
          {contentTypeLabel[activity.activityType] || activity.activityType}
        </p>
        <h3>{activity.title}</h3>
        <p>
          {activity.activityType} -{' '}
          {activity.isLocked
            ? 'Locked - premium access'
            : `${activity.accessPolicy === 'paid' ? 'Premium unlocked' : 'Free'} - ${status.replace('_', ' ')}`}
        </p>
      </div>
      {activity.isLocked ? (
        <span className="locked-quest-label">Unlock to continue</span>
      ) : (
        <div className="activity-actions">
          {hasStudyMaterial ? (
            <button
              className="activity-open-button"
              onClick={() => setIsOpen((open) => !open)}
              type="button"
            >
              {isOpen ? 'Hide quest' : 'Open quest'}
            </button>
          ) : null}
          <button
            disabled={mutation.isPending || status === 'completed' || (hasStudyMaterial && !isOpen)}
            onClick={() => mutation.mutate()}
            type="button"
          >
            {status === 'completed' ? 'Quest complete' : 'Complete quest'}
          </button>
        </div>
      )}
      {isOpen && !activity.isLocked ? <ActivityStudyContent activity={activity} /> : null}
    </li>
  );
};

const formatLessonPrice = (product) => {
  const amount = Number(product.price);
  if (!Number.isFinite(amount)) return product.currency || 'LKR';

  return new Intl.NumberFormat('en-LK', {
    currency: product.currency || 'LKR',
    maximumFractionDigits: 0,
    style: 'currency'
  }).format(amount);
};

const UnlockLessonButton = ({ lesson }) => {
  const navigate = useNavigate();
  const { add } = useOrderSelection();

  if (!lesson.hasPaidContent || lesson.premiumUnlocked) return null;

  if (!lesson.unlockProduct)
    return (
      <p className="unlock-coming">
        Premium content is being prepared for this lesson. Its unlock option will appear here once
        it is published.
      </p>
    );

  const unlockLesson = () => {
    add(lesson.unlockProduct);
    navigate('/student/orders/new');
  };

  return (
    <button className="unlock-lesson-button" onClick={unlockLesson} type="button">
      <span>Unlock the premium vault</span>
      <strong>{formatLessonPrice(lesson.unlockProduct)}</strong>
    </button>
  );
};

const LearningLessonCard = ({ courseSlug, lesson }) => {
  const progress = lessonProgress(lesson);
  const availability = lessonAvailability(lesson);
  const hasActivities = Boolean(lesson.activities?.length);
  const progressMessage = lesson.isLocked
    ? 'Unlock this lesson to track your progress.'
    : hasActivities
      ? progress.completedActivities +
        ' of ' +
        progress.totalAccessibleActivities +
        ' accessible quests complete'
      : 'Lesson content is being prepared.';

  return (
    <article className={'learning-lesson-card' + (lesson.isLocked ? ' is-locked' : '')}>
      <div className="learning-lesson-cover">
        <LessonImage lesson={lesson} />
        <span className="lesson-number-badge">{String(lesson.lessonNumber).padStart(2, '0')}</span>
      </div>
      <div className="learning-lesson-content">
        <div className="learning-lesson-heading">
          <div>
            <p className="lesson-number">Lesson {String(lesson.lessonNumber).padStart(2, '0')}</p>
            <h2>{lesson.title}</h2>
          </div>
          <span className={'lesson-access ' + availability.className}>{availability.label}</span>
        </div>
        {lesson.shortDescription ? (
          <p className="lesson-summary">{lesson.shortDescription}</p>
        ) : null}
        <div className="lesson-content-counts learning-content-counts">
          {lesson.freeContentCount ? <span>{lesson.freeContentCount} free quests</span> : null}
          {lesson.paidContentCount ? <span>{lesson.paidContentCount} premium quests</span> : null}
          {lesson.premiumUnlocked ? <span>Premium vault unlocked</span> : null}
        </div>
        <div className="lesson-progress">
          <div>
            <span>Progress</span>
            <strong>{progress.progressPercent}% complete</strong>
          </div>
          <progress
            aria-label={'Progress for ' + lesson.title}
            max="100"
            value={progress.progressPercent}
          />
          <p>{progressMessage}</p>
        </div>
        <UnlockLessonButton lesson={lesson} />
        <Link className="lesson-workspace-link" to={`/courses/${courseSlug}/lessons/${lesson.id}`}>
          {hasActivities ? 'Open lesson workspace' : 'View lesson details'}
        </Link>
      </div>
    </article>
  );
};

export const CourseLearningPage = () => {
  const { courseSlug } = useParams();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  usePageSeo({
    title: 'My A/L ICT Learning',
    description: 'Sign in to continue your A Plus ICT learning activities and saved progress.',
    noIndex: true,
    path: '/courses/' + courseSlug + '/learn'
  });
  const curriculum = useQuery({
    queryKey: queryKeys.content.publicCurriculum(courseSlug),
    queryFn: ({ signal }) => contentApi.publicCurriculum(courseSlug, signal)
  });
  const progress = useQuery({
    queryKey: queryKeys.learning.activityProgress(courseSlug),
    queryFn: ({ signal }) => learningApi.activityProgress(courseSlug, signal),
    enabled: false
  });
  const enrollment = useCourseEnrollment(curriculum.data?.data?.id, isAuthenticated && Boolean(curriculum.data?.data?.id));
  if (curriculum.isLoading || enrollment.isLoading) return <LoadingSkeleton />;
  if (curriculum.isError) return <InlineError error={curriculum.error} />;
  if (!isAuthenticated)
    return (
      <section className="login-cta">
        <p className="eyebrow">Student sign in</p>
        <h1>Continue with Google to start learning.</h1>
        <p>Sign in is required before opening activities or saving progress.</p>
        <a
          className="button"
          href={`${serviceUrls.auth}/api/v1/auth/google?returnTo=${encodeURIComponent(location.pathname)}`}
        >
          Continue with Google
        </a>
      </section>
    );
  if (!enrollment.data)
    return <section className="login-cta"><p className="eyebrow">Free enrollment</p><h1>Enroll before you start learning.</h1><p>Enrollment enables free chapter access and progress tracking for this course.</p><Link className="button" to={`/enroll/${courseSlug}`}>Enroll Free</Link></section>;
  const course = progress.data?.course || curriculum.data.data;
  const lessons = progress.data?.lessons || curriculum.data.data.lessons;
  return (
    <>
      <section className="lms-header">
        <div className="lms-progress-heading">
          <div>
            <p className="eyebrow">Learning quest</p>
            <h1>{course.title}</h1>
          </div>
          <strong className="course-progress-badge">
            {progress.data?.progressPercent || 0}% complete
          </strong>
        </div>
        <p className="course-progress-copy">
          {progress.data?.completedAccessibleActivities || 0} of{' '}
          {progress.data?.totalAccessibleActivities || 0} accessible content quests completed. Every
          premium unlock expands the total progress path.
        </p>
        <progress max="100" value={progress.data?.progressPercent || 0} />
      </section>
      <div className="lms-lessons">
        {lessons.map((lesson) => (
          <LearningLessonCard courseSlug={courseSlug} key={lesson.id} lesson={lesson} />
        ))}
      </div>
    </>
  );
};

const LessonMapItem = ({ courseSlug, lesson, selectedLessonId }) => {
  const progress = lessonProgress(lesson);
  const isCurrentLesson = lesson.id === selectedLessonId;

  return (
    <Link
      className={'lesson-map-item' + (isCurrentLesson ? ' current' : '')}
      to={`/courses/${courseSlug}/lessons/${lesson.id}`}
    >
      <span>{String(lesson.lessonNumber).padStart(2, '0')}</span>
      <div>
        <strong>{lesson.title}</strong>
        <small>{progress.progressPercent}% complete</small>
      </div>
    </Link>
  );
};

// The dedicated workspace keeps one lesson focused: learners can study,
// complete individual quests, and see the next locked opportunity without
// losing their position in the wider course.
export const LessonLearningPage = () => {
  const { courseSlug, lessonId } = useParams();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const curriculum = useQuery({
    queryKey: queryKeys.content.publicCurriculum(courseSlug),
    queryFn: ({ signal }) => contentApi.publicCurriculum(courseSlug, signal)
  });
  const progress = useQuery({
    queryKey: queryKeys.learning.activityProgress(courseSlug),
    queryFn: ({ signal }) => learningApi.activityProgress(courseSlug, signal),
    enabled: false
  });
  const enrollment = useCourseEnrollment(curriculum.data?.data?.id, isAuthenticated && Boolean(curriculum.data?.data?.id));

  const publicCourse = curriculum.data?.data;
  const lessons = progress.data?.lessons || publicCourse?.lessons || [];
  const lesson = lessons.find((item) => item.id === lessonId);

  usePageSeo({
    title: lesson ? lesson.title + ' | A Plus ICT' : 'A/L ICT Lesson',
    description: lesson?.shortDescription || 'Study A/L ICT content and track your progress.',
    noIndex: !isAuthenticated,
    path: `/courses/${courseSlug}/lessons/${lessonId}`
  });

  if (curriculum.isLoading || enrollment.isLoading) return <LoadingSkeleton />;
  if (curriculum.isError || progress.isError)
    return <InlineError error={curriculum.error || progress.error} />;
  if (!lesson) return <EmptyState title="This lesson is not available" />;

  if (!isAuthenticated)
    return (
      <section className="login-cta">
        <p className="eyebrow">Student sign in</p>
        <h1>Sign in to open this lesson.</h1>
        <p>
          Free quests are ready for you after Google sign-in. Your progress will save automatically.
        </p>
        <a
          className="button"
          href={`${serviceUrls.auth}/api/v1/auth/google?returnTo=${encodeURIComponent(location.pathname)}`}
        >
          Continue with Google
        </a>
      </section>
    );
  if (!enrollment.data)
    return <section className="login-cta"><p className="eyebrow">Course enrollment required</p><h1>Enroll free to open this lesson.</h1><Link className="button" to={`/enroll/${courseSlug}`}>Enroll Free</Link></section>;

  const currentIndex = lessons.findIndex((item) => item.id === lesson.id);
  const previousLesson = lessons[currentIndex - 1];
  const nextLesson = lessons[currentIndex + 1];
  const lessonStats = lessonProgress(lesson);
  const availability = lessonAvailability(lesson);
  const activities = lesson.activities || [];

  return (
    <div className="lesson-workspace">
      <section className="lesson-workspace-hero">
        <Link className="back-link" to={`/courses/${courseSlug}/learn`}>
          Back to course overview
        </Link>
        <div className="lesson-workspace-title">
          <div>
            <p className="eyebrow">Lesson {String(lesson.lessonNumber).padStart(2, '0')}</p>
            <h1>{lesson.title}</h1>
            <p>{lesson.shortDescription || 'Learn step by step, then mark each quest complete.'}</p>
          </div>
          <span className={'lesson-access ' + availability.className}>{availability.label}</span>
        </div>
        <div className="lesson-workspace-progress">
          <div>
            <span>Lesson progress</span>
            <strong>{lessonStats.progressPercent}% complete</strong>
          </div>
          <progress max="100" value={lessonStats.progressPercent} />
          <p>
            {lessonStats.completedActivities} of {lessonStats.totalAccessibleActivities} accessible
            quests complete
          </p>
        </div>
      </section>

      <div className="lesson-workspace-layout">
        <aside className="lesson-map">
          <p className="eyebrow">Course map</p>
          <h2>{publicCourse?.title}</h2>
          <nav aria-label="Course lessons">
            {lessons.map((item) => (
              <LessonMapItem
                courseSlug={courseSlug}
                key={item.id}
                lesson={item}
                selectedLessonId={lesson.id}
              />
            ))}
          </nav>
        </aside>

        <main className="lesson-study-panel">
          <div className="lesson-study-heading">
            <div>
              <p className="eyebrow">Today&apos;s quests</p>
              <h2>Learn, practise, complete</h2>
            </div>
            <span>{activities.length} content items</span>
          </div>
          {activities.length ? (
            <ol className="lesson-activity-list lesson-workspace-activities">
              {activities.map((activity) => (
                <ActivityRow activity={activity} courseSlug={courseSlug} key={activity.id} />
              ))}
            </ol>
          ) : (
            <EmptyState title="Lesson content is being prepared" />
          )}
          <UnlockLessonButton lesson={lesson} />
          <div className="lesson-workspace-navigation">
            {previousLesson ? (
              <Link to={`/courses/${courseSlug}/lessons/${previousLesson.id}`}>
                Previous lesson
              </Link>
            ) : (
              <span />
            )}
            {nextLesson ? (
              <Link to={`/courses/${courseSlug}/lessons/${nextLesson.id}`}>Next lesson</Link>
            ) : (
              <Link to={`/courses/${courseSlug}/learn`}>Return to course</Link>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export const StudentGuidePage = () => {
  usePageSeo({
    title: 'Student Guide',
    description:
      'Learn how to start A/L ICT lessons, use free resources, and understand progress at A Plus ICT.',
    path: '/student-guide'
  });

  return (
    <section className="prose-page guide-page">
      <p className="eyebrow">Student Guide</p>
      <h1>Start learning with a clear next step</h1>
      <p className="guide-intro">
        A Plus ICT is designed to help you begin with free learning, understand what is locked, and
        keep your progress organised.
      </p>
      <ol className="guide-steps">
        <li>
          <span>01</span>
          <div>
            <h2>Choose your learning medium</h2>
            <p>Select the A/L ICT course that suits you, then review the free lesson activity.</p>
          </div>
        </li>
        <li>
          <span>02</span>
          <div>
            <h2>Sign in when you are ready</h2>
            <p>
              Continue with Google to open lessons, save completed activities, and return easily.
            </p>
          </div>
        </li>
        <li>
          <span>03</span>
          <div>
            <h2>Use free resources alongside lessons</h2>
            <p>Download syllabus documents and teachers guides without creating an account.</p>
          </div>
        </li>
      </ol>
      <aside className="guide-note">
        <h2>How progress works</h2>
        <p>
          Your percentage is based on activities you can access. Paid activities stay clearly marked
          and do not reduce a free student&apos;s progress.
        </p>
      </aside>
      <div className="guide-actions">
        <Link className="button" to="/courses">
          Explore Courses
        </Link>
        <Link className="button secondary" to="/resources">
          Browse Free Resources
        </Link>
      </div>
    </section>
  );
};

const SitePage = ({ contact }) => {
  usePageSeo({
    title: contact ? 'Contact A Plus ICT' : 'About A Plus ICT',
    description: contact
      ? 'Contact A Plus ICT through WhatsApp and follow our social channels for A/L ICT learning updates.'
      : 'Discover A Plus ICT, a focused A/L ICT learning platform with structured courses and free resources.',
    path: contact ? '/contact' : '/about'
  });
  const query = useQuery({
    queryKey: queryKeys.content.siteProfile,
    queryFn: ({ signal }) => contentApi.siteProfile(signal)
  });
  if (query.isLoading) return <LoadingSkeleton />;
  if (query.isError) return <InlineError error={query.error} />;
  const profile = query.data.data;
  if (!profile) return <EmptyState title="Information will be published soon" />;
  if (contact)
    return (
      <section className="prose-page contact-page">
        <p className="eyebrow">Contact Us</p>
        <h1>Get in touch</h1>
        <p className="contact-intro">
          Have a question about lessons, free resources, or choosing the right course? Reach out
          through WhatsApp or follow A Plus ICT on your preferred platform.
        </p>
        {profile.contactChannels?.length ? (
          <ul className="contact-list">
            {profile.contactChannels.map((item) => (
              <li key={item.id}>
                {item.publicUrl ? (
                  <a href={item.publicUrl}>{item.label}</a>
                ) : (
                  `${item.label}: ${item.value}`
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>Contact details have not been published yet.</p>
        )}
        <SocialLinks links={profile.socialLinks} />
        <div className="contact-actions">
          {profile.contactChannels?.[0]?.publicUrl && (
            <a className="button" href={profile.contactChannels[0].publicUrl}>
              Message on WhatsApp
            </a>
          )}
          <Link className="button secondary" to="/courses">
            View Courses
          </Link>
        </div>
      </section>
    );
  return (
    <section className="prose-page about-page">
      <p className="eyebrow">About A Plus ICT</p>
      <h1>{profile.brandName}</h1>
      <div className="about-layout">
        <div className="about-tutor-frame">
          {profile.tutorResourceId ? (
            <ResourceImage
              alt={profile.tutorName || 'A Plus ICT educator'}
              className="about-tutor-image"
              resourceId={profile.tutorResourceId}
            />
          ) : (
            <img
              alt="A Plus ICT educator"
              className="about-tutor-image"
              src="/images/aplus-ict-tutor.png"
            />
          )}
        </div>
        <div className="about-copy">
          <p>{profile.shortDescription}</p>
          <h2>{profile.tutorName || 'Learn with a clearer ICT path'}</h2>
          <p>
            {profile.tutorBio ||
              'Focused course pathways, practical lesson activities, and useful study resources all live in one place.'}
          </p>
        </div>
      </div>
      <div className="about-value-grid">
        <article>
          <h2>Structured pathways</h2>
          <p>Move through lessons in a sequence that keeps each topic easy to follow.</p>
        </article>
        <article>
          <h2>Free resources</h2>
          <p>Find syllabus documents and study material without an unnecessary sign-in step.</p>
        </article>
        <article>
          <h2>Clear progress</h2>
          <p>See completed accessible activities at a glance when you return to learn.</p>
        </article>
      </div>
      <SocialLinks links={profile.socialLinks} />
      <div className="guide-actions">
        <Link className="button" to="/courses">
          View Courses
        </Link>
        <Link className="button secondary" to="/resources">
          Browse Resources
        </Link>
      </div>
    </section>
  );
};
export const AboutPage = () => <SitePage />;
export const ContactPage = () => <SitePage contact />;
