import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { contentApi } from '../api/content.api.js';
import { learningApi } from '../api/learning.api.js';
import { resourceApi } from '../api/resource.api.js';
import { serviceUrls } from '../api/service-urls.js';
import { queryKeys } from '../api/query-keys.js';
import { EmptyState, InlineError, LoadingSkeleton } from '../components/common/States.jsx';
import { ResourceImage } from '../components/resources/ResourceImage.jsx';
import { useAuth } from '../auth/auth-context.jsx';
import { usePageSeo } from '../seo/use-page-seo.js';
import { courseSeo, lessonSeo } from '../seo/public-seo-config.js';
import { trackPublicEvent } from '../analytics/events.js';
import { LessonPrice } from '../components/pricing/LessonPrice.jsx';
import { academicAreaForCourse, lessonPurchaseText } from '../config/lesson-pricing.js';
import { courseBreadcrumbs, isComingSoon } from '../utils/academic-course.js';
import { safeExternalUrl } from '../utils/safe-url.js';
import { useCourseEnrollment } from '../features/student/hooks.js';
import { StudentCourseOverview } from '../components/learning/StudentLessonPlayer.jsx';
import {
  BilingualHeading,
  CatalogueCourseCard
} from '../components/catalogue/CatalogueUi.jsx';

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
          {paidContent ? <span>{paidContent} full lesson content items</span> : null}
        </>
      ) : (
        <span>Lesson content is coming soon</span>
      )}
    </p>
  );
};

// Course cards use local imagery while the catalogue is being populated. The default
// keeps future courses presentable until an admin assigns API-managed resource metadata.
const courseCardImages = [
  '/images/learning-places/al-online-learning.webp',
  '/images/learning-places/lesson-focused-study.webp',
  '/images/learning-places/lesson-cafe-learning.webp',
  '/images/learning-places/lesson-campus-call.webp'
];

const courseCardImage = (course) => {
  const imageSeed = String(course.slug || course.id || course.title || 'course');
  const imageIndex = [...imageSeed].reduce((total, character) => total + character.charCodeAt(0), 0) % courseCardImages.length;
  return courseCardImages[imageIndex];
};

// Course descriptions can be filled in from the admin catalogue later. This
// fallback prevents empty cards while the initial syllabus content is prepared.
const courseDescription = (course) =>
  course.shortDescription ||
  course.description ||
  'Follow a structured lesson path, begin with free content, and build your A/L ICT confidence.';

const courseHeading = (course) => course?.medium?.code === 'sinhala'
  ? course.titleSi || course.title
  : course?.titleEn || course?.title;

// Reuse the supplied learning imagery as lightweight lesson covers. The number
// determines the image, so both Sinhala and English tracks stay visually aligned.
const lessonImages = [
  '/images/learning-places/student-guide-learning.webp',
  '/images/learning-places/practical-learning.webp',
  '/images/learning-places/lesson-tablet-headphones.webp',
  '/images/learning-places/lesson-laptop-focus.webp',
  '/images/learning-places/lesson-campus-call.webp',
  '/images/learning-places/lesson-headset-laptop.webp',
  '/images/learning-places/lesson-study-notes.webp',
  '/images/learning-places/lesson-webinar-notes.webp',
  '/images/learning-places/lesson-focused-study.webp',
  '/images/learning-places/lesson-cafe-learning.webp'
];

const lessonImage = (lessonNumber) => lessonImages[(lessonNumber - 1) % lessonImages.length];

const LessonImage = ({ lesson }) => (
  <img
    alt={'Lesson ' + lesson.lessonNumber + ': ' + lesson.title}
    className="lesson-card-image"
    height="360"
    loading="lazy"
    sizes="(min-width: 768px) 33vw, 100vw"
    src={lessonImage(lesson.lessonNumber)}
    width="600"
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
    return { className: 'coming', label: 'Lesson content coming soon' };
  if (freeContent && paidContent)
    return { className: 'mixed', label: 'Free content available + full lesson content' };
  if (freeContent) return { className: 'free', label: 'Free content available' };
  return { className: 'paid', label: 'Premium content' };
};

const LessonAvailabilityBadge = ({ lesson }) => {
  const available = Number(lesson.freeContentCount || 0) + Number(lesson.paidContentCount || 0) > 0;
  return (
    <span className={`availability-badge ${available ? 'active' : 'coming-soon'}`}>
      {available ? 'Available lesson' : 'Coming soon'}
    </span>
  );
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

const youtubeEmbedUrl = (url) => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const videoId = parsed.hostname === 'youtu.be'
      ? parsed.pathname.slice(1)
      : parsed.hostname.endsWith('youtube.com')
        ? parsed.searchParams.get('v')
        : null;
    return videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId)
      ? `https://www.youtube-nocookie.com/embed/${videoId}`
      : null;
  } catch {
    return null;
  }
};

const ActivityStudyContent = ({ activity }) => {
  const [fileError, setFileError] = useState('');
  const [isOpeningFile, setIsOpeningFile] = useState(false);
  const videoUrl = safeExternalUrl(activity.youtubeUrl);
  const embeddedVideoUrl = activity.config?.display === 'embedded'
    ? youtubeEmbedUrl(videoUrl)
    : null;

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
      {embeddedVideoUrl ? (
        <div className="lesson-video-frame">
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            src={embeddedVideoUrl}
            title={activity.title}
          />
        </div>
      ) : null}
      {videoUrl ? (
        <a className="activity-open-link" href={videoUrl} rel="noreferrer" target="_blank">
          {embeddedVideoUrl ? 'Open on YouTube' : 'Open video lesson'}
        </a>
      ) : null}
      {activity.resourceId ? (
        <button disabled={isOpeningFile} onClick={openAttachedResource} type="button">
          {isOpeningFile ? 'Opening resource...' : 'Open attached resource'}
        </button>
      ) : null}
      {!activity.content && !videoUrl && !activity.resourceId ? (
        <p>Study material will appear here when this activity is published.</p>
      ) : null}
      {fileError ? <p className="activity-study-error">{fileError}</p> : null}
    </div>
  );
};

const SyllabusLessonCard = ({ course, courseSlug, isEnrolled, lesson, progress }) => {
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
        <LessonAvailabilityBadge lesson={lesson} />
        <h3>{lesson.title}</h3>
        {lesson.shortDescription ? <p>{lesson.shortDescription}</p> : null}
        <div className="lesson-content-counts">
          {lesson.freeContentCount ? <span>{lesson.freeContentCount} free</span> : null}
          {lesson.paidContentCount ? <span>{lesson.paidContentCount} full lesson items</span> : null}
        </div>
        <span className={'lesson-access ' + availability.className}>{availability.label}</span>
        <LessonPrice area={academicAreaForCourse(course)} course={course} product={lesson.unlockProduct} />
        {isEnrolled ? (
          <div className="card-progress">
            <div>
              <span>Your progress</span>
              <strong>{lessonStats.progressPercent}%</strong>
            </div>
            <progress max="100" value={lessonStats.progressPercent} />
          </div>
        ) : null}
        <Link className="lesson-card-link" onClick={() => trackPublicEvent('lesson_preview_opened', { course_slug: courseSlug })} to={`/courses/${courseSlug}/lessons/${lesson.slug || lesson.id}`}>
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
          height="360"
          loading="lazy"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          src={courseCardImage(course)}
          width="600"
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
              {courseProgress?.totalAccessibleActivities || 0} available activities complete
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
    queryKey: queryKeys.content.publicCourses(),
    queryFn: ({ signal }) => contentApi.publicCourses({}, signal)
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

export const PublicHomePage = () => {
  const catalogue = useQuery({
    queryKey: queryKeys.content.publicCourses(),
    queryFn: ({ signal }) => contentApi.publicCourses({}, signal),
    staleTime: 60_000
  });
  const courses = (catalogue.data?.data || []).filter((course) => course.academicLevel?.code === 'AL');
  const sinhalaCourse = courses.find((course) => course.medium?.code === 'sinhala');
  const englishCourse = courses.find((course) => course.medium?.code === 'english');
  const [selectedSlug, setSelectedSlug] = useState('');
  const selectedCourse = courses.find((course) => course.slug === selectedSlug) || sinhalaCourse || englishCourse;
  const curriculum = useQuery({
    queryKey: queryKeys.content.publicCurriculum(selectedCourse?.slug || ''),
    queryFn: ({ signal }) => contentApi.publicCurriculum(selectedCourse.slug, signal),
    enabled: Boolean(selectedCourse?.slug),
    staleTime: 60_000
  });
  const courseLink = (course) => (course ? `/courses/${course.slug}` : '/courses');
  const lessons = curriculum.data?.data?.lessons || [];
  return (
    <>
      <section className="hero al-ict-hero">
        <img alt="A student learning A/L ICT online" className="hero-image" fetchPriority="high" height="900" loading="eager" src="/images/learning-hero.jpg" width="1600" />
        <div className="hero-copy">
          <p className="eyebrow">A/L ICT Learning Platform · <span lang="si">උසස් පෙළ ICT ඉගෙනුම් වේදිකාව</span></p>
          <h1>Master A/L ICT with a clear, structured learning path</h1>
          <p className="hero-sinhala" lang="si">සිංහල සහ ඉංග්‍රීසි මාධ්‍ය සඳහා පාඩම් 13ම ක්‍රමානුකූලව ඉගෙන ගන්න.</p>
          <p>
            Learn with videos, notes, activities and quizzes. Begin with free chapters, then save your progress as you continue.
          </p>
          <p className="hero-actions">
            <Link className="button" to={courseLink(sinhalaCourse)}>
              Start Sinhala Medium · <span lang="si">සිංහල මාධ්‍යයෙන් ආරම්භ කරන්න</span>
            </Link>
            <Link className="button secondary" to={courseLink(englishCourse)}>
              Start English Medium · <span lang="si">ඉංග්‍රීසි මාධ්‍යයෙන් ආරම්භ කරන්න</span>
            </Link>
          </p>
          <Link className="hero-text-link" to="/resources">Explore free lessons · <span lang="si">නොමිලේ පාඩම් බලන්න</span></Link>
        </div>
      </section>
      <section aria-label="A/L ICT benefits" className="benefit-strip">
        <div><strong>13</strong><span>Syllabus lessons<br /><small lang="si">විෂය නිර්දේශ පාඩම්</small></span></div>
        <div><strong>සිං / EN</strong><span>Sinhala & English Medium<br /><small lang="si">මාධ්‍ය දෙක සඳහා</small></span></div>
        <div><strong>✓</strong><span>Free chapters available<br /><small lang="si">නොමිලේ පාඩම්</small></span></div>
        <div><strong>↗</strong><span>Learning progress tracking<br /><small lang="si">ප්‍රගතිය සුරකින්න</small></span></div>
      </section>
      <section className="home-section" id="courses">
        <p className="eyebrow">Active A/L courses</p>
        <BilingualHeading english="Choose your A/L ICT medium" sinhala="ඔබගේ A/L ICT මාධ්‍යය තෝරන්න" />
        <p className="section-intro">Two separate learning paths, built around the same A/L ICT syllabus.</p>
        {catalogue.isLoading ? <LoadingSkeleton label="Loading A/L courses" /> : null}
        {catalogue.isError ? <InlineError error={catalogue.error} /> : null}
        {!catalogue.isLoading && !catalogue.isError && !courses.length ? <EmptyState title="A/L ICT courses are being prepared" /> : null}
        <div className="active-path-grid">{courses.slice(0, 2).map((course) => <HomeCourseCard course={course} key={course.id} />)}</div>
      </section>
      <section className="home-section syllabus-preview" id="syllabus">
        <p className="eyebrow">A/L syllabus preview</p>
        <h2>Explore the 13 A/L ICT lessons</h2>
        <p className="section-intro">Lesson availability is shown clearly before you start.</p>
        {courses.length > 1 ? <div className="syllabus-tabs" aria-label="Choose course medium">{courses.slice(0, 2).map((course) => <button aria-pressed={selectedCourse?.slug === course.slug} className={selectedCourse?.slug === course.slug ? 'selected' : ''} key={course.id} onClick={() => setSelectedSlug(course.slug)} type="button">{course.medium?.nameEn || course.medium?.name}</button>)}</div> : null}
        {curriculum.isLoading ? <LoadingSkeleton label="Loading syllabus lessons" /> : null}
        {curriculum.isError ? <InlineError error={curriculum.error} /> : null}
        {!curriculum.isLoading && !curriculum.isError && selectedCourse && !lessons.length ? <EmptyState title="The syllabus is being prepared"><Link className="text-link" to={courseLink(selectedCourse)}>View the course page</Link></EmptyState> : null}
        {lessons.length ? <><ol className="home-syllabus-list">{lessons.slice(0, 13).map((lesson) => <li key={lesson.id}><span>Lesson {String(lesson.lessonNumber).padStart(2, '0')}</span><strong>{lesson.title}</strong><em>{lesson.freeContentCount ? '✓ Free content available' : '🔒 Advanced content'}</em></li>)}</ol><Link className="text-link" to={courseLink(selectedCourse)}>View the complete course syllabus <span aria-hidden="true">→</span></Link></> : null}
      </section>
      <section className="home-section learning-highlight" id="how-it-works">
        <p className="eyebrow">How learning works</p>
        <BilingualHeading english="Start with a clear next step" sinhala="පැහැදිලි පියවරකින් ආරම්භ කරන්න" />
        <div className="steps-grid">
          <article>
            <span>01</span>
            <h3>Choose Sinhala or English Medium</h3><p lang="si">සිංහල හෝ ඉංග්‍රීසි මාධ්‍යය තෝරන්න.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Sign in securely with Google</h3>
            <p lang="si">Google සමඟ ආරක්ෂිතව පිවිසෙන්න.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Learn free chapters and track progress</h3>
            <p lang="si">නොමිලේ පාඩම් ඉගෙන ප්‍රගතිය සටහන් කරගන්න.</p>
          </article>
          <article>
            <span>04</span>
            <h3>Unlock advanced content when required</h3>
            <p lang="si">ලබාගත හැකි විට උසස් පාඩම් අගුළු හරින්න.</p>
          </article>
        </div>
      </section>
      <section className="home-section tutor-preview">
        <div className="tutor-image-frame">
          <img
            alt="WARR Wijesinghe"
            className="tutor-image"
            height="720"
            loading="lazy"
            src="/images/aplus-ict-tutor.png"
            width="720"
          />
        </div>
        <div>
          <p className="eyebrow">Meet your tutor</p>
          <h2>WARR Wijesinghe</h2>
          <p>ICT Educator · Software Engineer</p>
          <p>
            Build a clear foundation, practise consistently, and move through every lesson with confidence.
          </p>
          <Link className="text-link" to="/about">
            About A Plus ICT <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
      <section className="home-section access-comparison"><p className="eyebrow">One learning path</p><h2>Start free. Unlock more when you need it.</h2><p className="section-intro">Free and unlocked content stay together in the same lesson path.</p><div className="comparison-grid"><article><h3>Free access</h3><ul><li>Selected video chapters</li><li>Selected notes and activities</li><li>Progress tracking</li></ul></article><article><h3>Unlocked lesson access</h3><ul><li>Complete lesson content</li><li>Additional notes and activities</li><li>Complete lesson progress</li></ul></article></div></section>
      <section className="home-section guide-preview"><img alt="Student taking notes while learning online" className="guide-image" loading="lazy" src="/images/learning-places/student-guide-learning.webp" /><div><p className="eyebrow">Student guide</p><h2>New to the learning flow?</h2><p>Learn how Google sign-in, free activities, and learning progress work before you begin.</p></div><Link className="text-link" to="/student-guide">Read the student guide <span aria-hidden="true">→</span></Link></section>
      <section className="home-section coming-soon-section"><p className="eyebrow">Coming next</p><h2>O/L ICT is coming next</h2><p>Future learning paths for Grade 10 and Grade 11 are being prepared. Questions? <Link to="/contact">Contact A Plus ICT</Link>.</p></section>
      <section className="home-section faq-section"><p className="eyebrow">FAQ</p><h2>Questions before you begin?</h2><div className="faq-list">{[['Can I start with free lessons?', 'Yes. Selected chapters and activities are available in the same course path.'], ['Are Sinhala and English Medium separate?', 'Yes. Choose the A/L ICT course that matches your medium.'], ['Do I need a Google account?', 'Yes. Google sign-in is used to open learning content and save progress.'], ['How is progress calculated?', 'Progress is based on the learning activities available to your account.'], ['Can I unlock lessons individually?', 'Where an unlock option is available, it is shown on the relevant lesson.'], ['What content is included in a lesson?', 'Lessons can include videos, notes, activities and quizzes.']].map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>
      <section className="final-home-cta"><div><p className="eyebrow">A Plus ICT</p><h2>Start learning A/L ICT today</h2><p lang="si">අදම ඔබගේ A/L ICT ඉගෙනීම ආරම්භ කරන්න.</p></div><div className="hero-actions"><Link className="button" to={courseLink(sinhalaCourse)}>Start Sinhala Medium</Link><Link className="button secondary" to={courseLink(englishCourse)}>Start English Medium</Link></div></section>
    </>
  );
};

const HomeCourseCard = ({ course }) => <CatalogueCourseCard area="AL" course={course} />;

const SocialLinks = ({ links = [] }) => {
  if (!links.length) return null;
  return (
    <section className="social-section">
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

export const PublicCoursesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  usePageSeo({
    title: 'ICT Course Catalogue in Sinhala and English',
    description:
      'Browse Sri Lankan ICT courses from Grade 6 to A/L in separate Sinhala and English-medium learning paths.',
    path: '/courses'
  });
  const catalogue = useQuery({
    queryKey: queryKeys.content.publicCourses(),
    queryFn: ({ signal }) => contentApi.publicCourses({}, signal),
    staleTime: 60_000
  });
  const stage = searchParams.get('stage');
  const grade = searchParams.get('grade');
  const medium = searchParams.get('medium');
  const filteredCourses = (catalogue.data?.data || []).filter((course) => {
    const level = String(course.academicLevel?.code || '').toLowerCase();
    const courseStage = level === 'al' || course.slug?.startsWith('al-') ? 'al' : level === 'ol' || course.slug?.startsWith('ol-') ? 'ol' : /grade_?[6-9]/.test(level) || course.slug?.startsWith('grade-') ? 'school' : '';
    const courseGrade = String(course.grade || level).match(/(?:grade_?)?(6|7|8|9|10|11|12|13)/)?.[1];
    const courseMedium = course.medium?.code === 'sinhala' ? 'si' : course.medium?.code === 'english' ? 'en' : course.medium?.code;
    return (!stage || courseStage === stage) && (!grade || courseGrade === grade) && (!medium || courseMedium === medium);
  });
  const clearFilters = () => setSearchParams({});
  const groups = Object.values(filteredCourses.reduce((result, course) => {
    const code = course.academicLevel?.code;
    if (!code) return result;
    result[code] ||= { level: course.academicLevel, courses: [] };
    result[code].courses.push(course);
    return result;
  }, {})).sort((a, b) => (a.level?.code || '').localeCompare(b.level?.code || '', undefined, { numeric: true }));

  return (
    <section className="catalogue-page home-section">
      <p className="eyebrow">Course catalogue</p>
      <BilingualHeading as="h1" english="ICT Courses from Grade 6 to A/L" sinhala="6 ශ්‍රේණියේ සිට උසස් පෙළ දක්වා ICT පාඨමාලා" />
      <p className="section-intro">Choose your academic level and medium to view its course details, syllabus and available lessons.</p>
      {catalogue.isPending ? <LoadingSkeleton label="Loading courses" /> : null}
      {catalogue.isError ? <InlineError error={catalogue.error} onRetry={catalogue.refetch} /> : null}
      {catalogue.isSuccess && !groups.length ? <EmptyState title="No matching courses are available yet"><p>Try another grade or medium, or return to a pathway.</p>{(stage || grade || medium) ? <button className="button" onClick={clearFilters} type="button">Clear filters</button> : null}</EmptyState> : null}
      <div className="course-level-groups">{groups.map((group) => (
        <section className="course-level-group" key={group.level.code}>
          <BilingualHeading english={`${group.level.nameEn} ICT`} sinhala={`${group.level.nameSi} ICT`} />
          <div className={`catalogue-course-grid catalogue-course-grid-${group.courses.length > 2 ? 3 : 2}`}>{group.courses.map((course) => <CatalogueCourseCard course={course} key={course.id} />)}</div>
        </section>
      ))}</div>
    </section>
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
  const enrollment = useCourseEnrollment(query.data?.data?.id, isAuthenticated && Boolean(query.data?.data?.id));
  const learningProgress = useQuery({
    queryKey: queryKeys.learning.activityProgress(courseSlug),
    queryFn: ({ signal }) => learningApi.activityProgress(courseSlug, signal),
    enabled: isAuthenticated && Boolean(enrollment.data)
  });
  const course = query.data?.data;
  usePageSeo({
    title: course ? courseSeo(course).title : 'ICT Course',
    description: course ? courseSeo(course).description : 'Explore a structured ICT learning path.',
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
  if (query.isPending || curriculum.isPending || enrollment.isLoading)
    return <LoadingSkeleton label="Loading course" />;
  if (query.isError || curriculum.isError) return <InlineError error={query.error || curriculum.error} onRetry={() => { query.refetch(); curriculum.refetch(); }} />;
  if (!course) return <EmptyState title="This course is not available" />;
  const lessons = curriculum.data?.data?.lessons || [];
  const comingSoon = isComingSoon(course);
  const progressByLesson = new Map(
    (learningProgress.data?.lessons || []).map((lesson) => [lesson.id, lesson.progress])
  );
  return (
    <>
      <nav aria-label="Breadcrumb" className="breadcrumbs">{courseBreadcrumbs(course).map((item, index) => <span key={`${item.label}-${index}`}>{index ? <span aria-hidden="true">/</span> : null}{item.path ? <Link to={item.path}>{item.label}</Link> : <span>{item.label}</span>}</span>)}</nav>
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
              height="675"
              loading="eager"
              sizes="(min-width: 768px) 50vw, 100vw"
              src={courseCardImage(course)}
              width="1200"
            />
          )}
        </div>
        <div>
          <p className="eyebrow">{course.academicLevel?.nameEn || 'ICT'} · {course.medium?.nameEn || course.medium?.name || course.medium?.code}</p>
          <h1 lang={course.medium?.code === 'sinhala' ? 'si' : undefined}>{courseHeading(course)}</h1>
          <p className="course-detail-description">{courseDescription(course)}</p>
          <p className="course-online-value">Online school ICT learning—study this course anytime, from anywhere.</p>
          {counts(course)}
          <LessonPrice area={academicAreaForCourse(course)} course={course} />
          <p className="course-detail-note">
            Free content may be available first. Full lesson content is available after purchasing the lesson.
          </p>
          {comingSoon ? <p className="course-detail-note">Coming Soon — this course cannot be enrolled in or purchased yet.</p> : <div className="course-detail-actions"><Link className="button" to={enrollment.data ? `/courses/${course.slug}/learn` : `/enroll/${course.slug}`}>{enrollment.data ? 'Continue Learning' : isAuthenticated ? 'Enroll Free' : 'Login to Enroll'}</Link></div>}
        </div>
      </section>
      <section className="syllabus-summary">
        <p className="eyebrow">Syllabus overview</p>
        <h2>Complete syllabus and lessons</h2>
        <p className="syllabus-intro">
          View each published lesson, its topics, free content and full lesson access where available.
        </p>
        {lessons.length ? (
          <div className="syllabus-lesson-grid">
            {lessons.map((lesson) => (
              <SyllabusLessonCard
                course={course}
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
            ? 'Locked — purchase required'
            : `${activity.accessPolicy === 'paid' ? 'Purchased lesson' : 'Free content'} - ${status.replace('_', ' ')}`}
        </p>
      </div>
      {activity.isLocked ? (
        <span className="locked-lesson-label">Buy lesson to continue</span>
      ) : (
        <div className="activity-actions">
          {hasStudyMaterial ? (
            <button
              aria-controls={`activity-content-${activity.id}`}
              aria-expanded={isOpen}
              className="activity-open-button"
              onClick={() => setIsOpen((open) => !open)}
              type="button"
            >
              {isOpen ? 'Hide activity' : 'Open activity'}
            </button>
          ) : null}
          <button
            disabled={mutation.isPending || status === 'completed' || (hasStudyMaterial && !isOpen)}
            onClick={() => mutation.mutate()}
            type="button"
          >
            {status === 'completed' ? 'Activity complete' : 'Complete activity'}
          </button>
        </div>
      )}
      {isOpen && !activity.isLocked ? <div id={`activity-content-${activity.id}`}><ActivityStudyContent activity={activity} /></div> : null}
    </li>
  );
};

const UnlockLessonButton = ({ course, lesson }) => {
  const navigate = useNavigate();

  if (!lesson.hasPaidContent || lesson.premiumUnlocked) return null;

  if (!lesson.unlockProduct)
    return (
      <p className="unlock-coming">
        Full lesson content is being prepared for this lesson. Its purchase option will appear here once
        it is published.
      </p>
    );

  const unlockLesson = () => {
    navigate(`/courses/${course.slug}/lessons/${lesson.slug || lesson.id}/exam-success-pack`);
  };

  return (
    <button className="unlock-lesson-button" onClick={() => { trackPublicEvent('lesson_purchase_started', { course_slug: course?.slug }); unlockLesson(); }} type="button">
      <span>{lessonPurchaseText({ area: academicAreaForCourse(course), course, product: lesson.unlockProduct })} · <span lang="si">මෙම පාඩම මිලදී ගන්න</span></span>
    </button>
  );
};

const LearningLessonCard = ({ course, courseSlug, lesson }) => {
  const progress = lessonProgress(lesson);
  const availability = lessonAvailability(lesson);
  const hasActivities = Boolean(lesson.activities?.length);
  const progressMessage = lesson.isLocked
    ? 'Unlock this lesson to track your progress.'
    : hasActivities
      ? progress.completedActivities +
        ' of ' +
        progress.totalAccessibleActivities +
        ' available activities complete'
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
          <div className="lesson-card-status">
            <LessonAvailabilityBadge lesson={lesson} />
            <span className={'lesson-access ' + availability.className}>{availability.label}</span>
          </div>
        </div>
        {lesson.shortDescription ? (
          <p className="lesson-summary">{lesson.shortDescription}</p>
        ) : null}
        <div className="lesson-content-counts learning-content-counts">
          {lesson.freeContentCount ? <span>{lesson.freeContentCount} free activities</span> : null}
          {lesson.paidContentCount ? <span>{lesson.paidContentCount} full lesson items</span> : null}
          {lesson.premiumUnlocked ? <span>Purchased · මිලදීගෙන ඇත</span> : null}
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
        <LessonPrice area={academicAreaForCourse(course)} course={course} product={lesson.unlockProduct} />
        <UnlockLessonButton course={course} lesson={lesson} />
        <Link className="lesson-workspace-link" to={`/courses/${courseSlug}/lessons/${lesson.slug || lesson.id}`}>
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
  return <StudentCourseOverview courseSlug={courseSlug} />;
};

const LessonMapItem = ({ courseSlug, lesson, selectedLessonId }) => {
  const progress = lessonProgress(lesson);
  const isCurrentLesson = lesson.id === selectedLessonId;

  return (
    <Link
      className={'lesson-map-item' + (isCurrentLesson ? ' current' : '')}
      to={`/courses/${courseSlug}/lessons/${lesson.slug || lesson.id}`}
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
// complete individual activities, and see the next locked opportunity without
// losing their position in the wider course.
export const LegacyLessonLearningPage = () => {
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
          Available free activities are ready for you after Google sign-in. Your progress will save automatically.
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
            <p>{lesson.shortDescription || 'Learn step by step, then mark each activity complete.'}</p>
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
            activities complete
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
              <p className="eyebrow">Today&apos;s activities</p>
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
          <UnlockLessonButton course={publicCourse} lesson={lesson} />
          <div className="lesson-workspace-navigation">
            {previousLesson ? (
              <Link to={`/courses/${courseSlug}/lessons/${previousLesson.slug || previousLesson.id}`}>
                Previous lesson
              </Link>
            ) : (
              <span />
            )}
            {nextLesson ? (
              <Link to={`/courses/${courseSlug}/lessons/${nextLesson.slug || nextLesson.id}`}>Next lesson</Link>
            ) : (
              <Link to={`/courses/${courseSlug}/learn`}>Return to course</Link>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

const PublicContentItem = ({ item }) => {
  const isRichContent = Boolean(item.content || item.youtubeUrl || item.resourceId);
  return (
    <article className={`public-content-item ${item.isLocked ? 'locked' : ''}`} id={`content-${item.id}`}>
      <div>
        <p className="activity-type-label">{contentTypeLabel[item.contentType] || item.contentType}</p>
        <h3>{item.title}</h3>
        {item.descriptionEn ? <p>{item.descriptionEn}</p> : null}
      </div>
      {item.isLocked ? (
        <p className="locked-content-message">🔒 Purchase this lesson to unlock this content.</p>
      ) : isRichContent ? (
        <ActivityStudyContent activity={item} />
      ) : (
        <p>Learning content is being prepared.</p>
      )}
    </article>
  );
};

const LessonContents = ({ lesson, onNavigate, open, selectedHash, setOpen }) => (
  <details className="lesson-content-tree" onToggle={(event) => setOpen(event.currentTarget.open)} open={open}>
    <summary><span>This lesson</span><strong>Lesson contents</strong></summary>
    <nav aria-label="Lesson content navigation">
      <ol>
        {lesson.topics?.map((topic, index) => {
          const topicHash = `#topic-${topic.id}`;
          return (
            <li key={topic.id}>
              <a aria-current={selectedHash === topicHash ? 'location' : undefined} href={topicHash} onClick={onNavigate}>{String(index + 1).padStart(2, '0')}. {topic.title}</a>
              {topic.contentItems?.length ? (
                <ul>
                  {topic.contentItems.map((item) => {
                    const itemHash = `#content-${item.id}`;
                    return <li key={item.id}><a aria-current={selectedHash === itemHash ? 'location' : undefined} href={itemHash} onClick={onNavigate}>{item.title}</a></li>;
                  })}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  </details>
);

export const LessonLearningPage = () => {
  const { courseSlug, lessonSlug } = useParams();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [contentsOpen, setContentsOpen] = useState(false);
  const query = useQuery({
    queryKey: queryKeys.content.publicLesson(courseSlug, lessonSlug),
    queryFn: ({ signal }) => contentApi.publicLesson(courseSlug, lessonSlug, signal),
  });
  const course = query.data?.data?.course;
  const lesson = query.data?.data?.lesson;
  const enrollment = useCourseEnrollment(course?.id, isAuthenticated && Boolean(course?.id));
  usePageSeo({
    title: lesson ? lessonSeo(lesson, course).title : 'ICT Lesson',
    description: lesson ? lessonSeo(lesson, course).description : 'Explore ICT lesson content at A Plus ICT.',
    path: `/courses/${courseSlug}/lessons/${lessonSlug}`,
    structuredData: lesson && course ? {
      '@context': 'https://schema.org', '@type': 'LearningResource', name: lesson.title,
      isAccessibleForFree: lesson.freeContentCount > 0,
    } : null,
  });
  if (query.isPending) return <LoadingSkeleton label="Loading lesson" />;
  if (query.isError) return <InlineError error={query.error} onRetry={query.refetch} />;
  if (!lesson) return <EmptyState title="This lesson is not available" />;
  const topicCount = lesson.topics?.length || 0;
  if (!isAuthenticated) return (
    <section className="login-cta">
      <p className="eyebrow">Student sign in</p>
      <h1>{lesson.title}</h1>
      <p>{lesson.descriptionEn || lesson.shortDescription || 'Sign in to open this lesson and save your progress.'}</p>
      <p>{topicCount} topics · {lesson.freeContentCount || 0} free items · {lesson.paidContentCount || 0} locked items</p>
      {lesson.topics?.length ? <ul className="lesson-topic-preview">{lesson.topics.map((topic) => <li key={topic.id}>{topic.title}</li>)}</ul> : null}
      <a className="button" href={`${serviceUrls.auth}/api/v1/auth/google?returnTo=${encodeURIComponent(location.pathname + location.search)}`}>Continue with Google to Start This Lesson</a>
    </section>
  );
  if (enrollment.isPending) return <LoadingSkeleton label="Checking lesson access" />;
  if (!enrollment.data) return (
    <section className="login-cta">
      <p className="eyebrow">Free enrollment</p><h1>Enroll Free to Open Available Lesson Content</h1>
      <p>Free and unlocked content remain together in this lesson after enrollment.</p>
      <Link className="button" to={`/enroll/${courseSlug}`}>Enroll Free to Start</Link>
    </section>
  );
  return (
    <div className="lesson-workspace public-lesson-workspace">
      <nav aria-label="Breadcrumb" className="breadcrumbs"><Link to="/">Home</Link><span>/</span><Link to={`/courses/${courseSlug}`}>{course?.title}</Link><span>/</span><span>{lesson.title}</span></nav>
      <section className="lesson-workspace-hero">
        <div className="lesson-workspace-title">
          <div><p className="eyebrow">Lesson {String(lesson.lessonNumber).padStart(2, '0')}</p><h1>{lesson.title}</h1><p>{lesson.descriptionEn || lesson.shortDescription}</p></div>
          <span className="lesson-access">{lesson.premiumUnlocked ? 'Lesson unlocked' : 'Free and locked content'}</span>
        </div>
        <p className="lesson-topic-summary">{topicCount} topic{topicCount === 1 ? '' : 's'} · {lesson.freeContentCount} free items · {lesson.paidContentCount} locked items</p>
        <LessonPrice area={academicAreaForCourse(course)} course={course} product={lesson.unlockProduct} />
        {!lesson.premiumUnlocked && lesson.unlockProduct ? <UnlockLessonButton course={course} lesson={lesson} /> : null}
      </section>
      <div className="public-lesson-layout">
        <LessonContents lesson={lesson} onNavigate={() => setContentsOpen(false)} open={contentsOpen} selectedHash={location.hash} setOpen={setContentsOpen} />
        <section className="topic-learning-area" aria-label="Lesson topics">
          {lesson.topics?.length ? lesson.topics.map((topic, index) => (
            <section className="lesson-topic" id={`topic-${topic.id}`} key={topic.id}>
              <p className="eyebrow">Topic {String(index + 1).padStart(2, '0')}</p><h2>{topic.title}</h2>
              {topic.descriptionEn ? <p>{topic.descriptionEn}</p> : null}
              <div className="public-content-list">{topic.contentItems.map((item) => <PublicContentItem item={item} key={item.id} />)}</div>
            </section>
          )) : <EmptyState title="Lesson content is being prepared" />}
        </section>
      </div>
      <p className="lesson-back-link"><Link to={`/courses/${courseSlug}`}>Back to course details</Link></p>
    </div>
  );
};

export const StudentGuidePage = () => {
  usePageSeo({ path: '/student-guide' });

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
        <Link className="button" to="/#pathways">
          Choose Your Grade
        </Link>
        <Link className="button secondary" to="/resources">
          Browse Free Resources
        </Link>
      </div>
    </section>
  );
};

const SitePage = ({ contact }) => {
  usePageSeo({ path: contact ? '/contact' : '/about' });
  const query = useQuery({
    queryKey: queryKeys.content.siteProfile,
    queryFn: ({ signal }) => contentApi.siteProfile(signal)
  });
  if (query.isPending) return <LoadingSkeleton label="Loading information" />;
  if (query.isError) return <InlineError error={query.error} onRetry={query.refetch} />;
  const profile = query.data.data;
  if (!profile) return <EmptyState title="Information will be published soon" />;
  if (contact)
    return (
      <section className="prose-page contact-page">
        <p className="eyebrow">Contact Us</p>
        <h1>Get in touch</h1>
        <p className="contact-intro">
          Get help with course selection, lesson access, payment or enrollment, and general ICT
          learning questions through the contact channels published below.
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
        {profile.legalBusinessName ? <section><h2>Legal business details</h2><p><strong>{profile.legalBusinessName}</strong><br />Company Registration No: {profile.companyRegistrationNumber}<br />{profile.registeredAddress?.line1}, {profile.registeredAddress?.line2}, {profile.registeredAddress?.city}, {profile.registeredAddress?.country}</p></section> : null}
        <div className="contact-actions">
          {profile.contactChannels?.[0]?.publicUrl && (
            <a className="button" href={profile.contactChannels[0].publicUrl}>
              Message on WhatsApp
            </a>
          )}
          <Link className="button secondary" to="/#pathways">Choose Your Grade</Link>
        </div>
      </section>
    );
  return (
    <section className="prose-page about-page">
      <p className="eyebrow">About A Plus ICT</p>
      <h1>Online ICT Learning Built Around Real Student Life</h1>
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
          <p>Students do not always have the same timetable, location, device, or learning speed. A Plus ICT makes the Sri Lankan school ICT syllabus available through a flexible, organised, and student-friendly online learning experience.</p>
          <p><strong>Study ICT Anytime. Anywhere.</strong> Learn in Sinhala or English Medium, follow a structured sequence, and begin with available free content before unlocking more learning.</p>
          <p>{profile.tutorName || 'WARR Wijesinghe'} is an ICT Educator, Software Engineer, and Founder of A Plus ICT.</p>
          {profile.legalBusinessName ? <><h2>Our operator</h2><p>{profile.relationshipStatement} The service is operated by <strong>{profile.legalBusinessName}</strong> (Company Registration No: {profile.companyRegistrationNumber}), registered at {profile.registeredAddress?.line1}, {profile.registeredAddress?.line2}, {profile.registeredAddress?.city}, {profile.registeredAddress?.country}.</p></> : null}
          <h2>Our Mission</h2>
          <p>
            To give every Sri Lankan school student a clear and accessible path to learn ICT—regardless of location, timetable, or learning speed.
          </p>
        </div>
      </div>
      <div className="about-value-grid">
        <article>
          <h2>Accessible</h2>
          <p>Students should be able to learn from commonly available devices.</p>
        </article>
        <article>
          <h2>Flexible</h2>
          <p>Learning should continue without depending on a fixed time or physical location.</p>
        </article>
        <article>
          <h2>Structured and Understandable</h2>
          <p>Every lesson belongs to a clear grade and sequence, with complex ICT concepts explained clearly.</p>
        </article>
      </div>
      <SocialLinks links={profile.socialLinks} />
      <div className="guide-actions">
        <Link className="button" to="/#pathways">Choose Your Grade</Link>
        <Link className="button secondary" to="/resources">
          Browse Resources
        </Link>
      </div>
    </section>
  );
};
export const AboutPage = () => <SitePage />;
export const ContactPage = () => <SitePage contact />;
