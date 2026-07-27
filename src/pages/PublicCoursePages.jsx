import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation, useParams } from 'react-router-dom';
import { contentApi } from '../api/content.api.js';
import { learningApi } from '../api/learning.api.js';
import { serviceUrls } from '../api/service-urls.js';
import { queryKeys } from '../api/query-keys.js';
import { EmptyState, InlineError, LoadingSkeleton } from '../components/common/States.jsx';
import { ResourceImage } from '../components/resources/ResourceImage.jsx';
import { useAuth } from '../auth/auth-context.jsx';

const counts = (course) => (
  <p className="course-counts">
    <span>{course.syllabusLessonCount || 0} lessons</span>
    <span>{course.freeActivityCount || 0} free activities</span>
  </p>
);

const CourseCard = ({ course }) => (
  <article className="public-course-card">
    <div className="course-image-frame">
      <ResourceImage
        alt={`${course.title} course cover`}
        className="course-image"
        resourceId={course.thumbnailResourceId}
      />
    </div>
    <div className="course-card-content">
      <p className="eyebrow">{course.medium?.name || course.medium?.code}</p>
      <h2>{course.title}</h2>
      <p>{course.shortDescription}</p>
      {counts(course)}
      <Link className="button" to={`/courses/${course.slug}`}>
        Start Learning Free
      </Link>
    </div>
  </article>
);

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
  const profile = useQuery({
    queryKey: queryKeys.content.siteProfile,
    queryFn: ({ signal }) => contentApi.siteProfile(signal),
    retry: false
  });
  const data = profile.data?.data;
  return (
    <>
      <section className="hero al-ict-hero">
        {data?.bannerResourceId && (
          <ResourceImage
            alt="A Plus ICT students learning"
            className="hero-image"
            loading="eager"
            resourceId={data.bannerResourceId}
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
            <Link className="button secondary" to="/student-guide">
              Student Guide
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
        <div>
          <p className="eyebrow">Student guide</p>
          <h2>New to the learning flow?</h2>
          <p>Learn how sign-in, free activities, and learning progress work before you begin.</p>
        </div>
        <Link className="text-link" to="/student-guide">
          Read the student guide <span aria-hidden="true">→</span>
        </Link>
      </section>
      {data?.tutorResourceId || data?.tutorName ? (
        <section className="home-section tutor-preview">
          <div className="tutor-image-frame">
            <ResourceImage
              alt={data.tutorName || 'A Plus ICT tutor'}
              className="tutor-image"
              resourceId={data.tutorResourceId}
            />
          </div>
          <div>
            <p className="eyebrow">Meet your tutor</p>
            <h2>{data.tutorName || 'A Plus ICT tutor'}</h2>
            <p>{data.tutorTitle}</p>
            <p>{data.tutorBio}</p>
            <Link className="text-link" to="/about">
              About A Plus ICT <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      ) : null}
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

export const PublicCoursesPage = () => (
  <>
    <section className="track-heading">
      <p className="eyebrow">Courses</p>
      <h1>A/L ICT learning paths</h1>
      <p>Choose Sinhala Medium or English Medium from the published catalogue.</p>
    </section>
    <CourseGrid />
  </>
);

export const PublicCourseDetailPage = () => {
  const { courseSlug } = useParams();
  const query = useQuery({
    queryKey: queryKeys.content.publicCourse(courseSlug),
    queryFn: ({ signal }) => contentApi.publicCourse(courseSlug, signal)
  });
  const curriculum = useQuery({
    queryKey: queryKeys.content.publicCurriculum(courseSlug),
    queryFn: ({ signal }) => contentApi.publicCurriculum(courseSlug, signal)
  });
  if (query.isLoading || curriculum.isLoading) return <LoadingSkeleton />;
  if (query.isError || curriculum.isError)
    return <InlineError error={query.error || curriculum.error} />;
  const course = query.data.data;
  const lessons = curriculum.data?.data?.lessons || [];
  return (
    <>
      <section className="course-detail-hero">
        <div className="course-hero-image-frame">
          <ResourceImage
            alt={`${course.title} course hero`}
            className="course-hero-image"
            resourceId={course.heroResourceId}
          />
        </div>
        <div>
          <p className="eyebrow">{course.medium?.name || course.medium?.code}</p>
          <h1>{course.title}</h1>
          <p>{course.description || course.shortDescription}</p>
          {counts(course)}
          <p className="course-counts">
            <span>{course.paidActivityCount || 0} paid activities</span>
          </p>
          <Link className="button" to={`/courses/${course.slug}/learn`}>
            Start Learning With Free Lessons
          </Link>
        </div>
      </section>
      <section className="syllabus-summary">
        <p className="eyebrow">Syllabus overview</p>
        <h2>Ordered lesson summary</h2>
        {lessons.length ? (
          <ol>
            {lessons.map((lesson) => (
              <li key={lesson.id}>
                <span>Lesson {String(lesson.lessonNumber).padStart(2, '0')}</span>
                <strong>{lesson.title}</strong>
                {lesson.shortDescription ? <p>{lesson.shortDescription}</p> : null}
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState title="Syllabus lessons will be published soon" />
        )}
      </section>
    </>
  );
};

const ActivityRow = ({ activity, courseSlug }) => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => learningApi.completeActivity(activity.id, { courseSlug }),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.learning.activityProgress(courseSlug) })
  });
  const status = activity.progress?.status || 'not_started';
  return (
    <li
      className={`lms-activity ${activity.isLocked ? 'locked' : ''} ${status === 'completed' ? 'completed' : ''}`}
    >
      <span>{String(activity.displayOrder).padStart(2, '0')}</span>
      <div>
        <h3>{activity.title}</h3>
        <p>
          {activity.activityType} ·{' '}
          {activity.isLocked ? 'Locked — paid access' : `Free · ${status.replace('_', ' ')}`}
        </p>
      </div>
      {activity.isLocked ? (
        <button disabled type="button">
          Available with paid access
        </button>
      ) : (
        <button
          disabled={mutation.isPending || status === 'completed'}
          onClick={() => mutation.mutate()}
          type="button"
        >
          {status === 'completed' ? 'Completed' : 'Mark complete'}
        </button>
      )}
    </li>
  );
};

export const CourseLearningPage = () => {
  const { courseSlug } = useParams();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const curriculum = useQuery({
    queryKey: queryKeys.content.publicCurriculum(courseSlug),
    queryFn: ({ signal }) => contentApi.publicCurriculum(courseSlug, signal)
  });
  const progress = useQuery({
    queryKey: queryKeys.learning.activityProgress(courseSlug),
    queryFn: ({ signal }) => learningApi.activityProgress(courseSlug, signal),
    enabled: isAuthenticated
  });
  if (curriculum.isLoading || (isAuthenticated && progress.isLoading)) return <LoadingSkeleton />;
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
  const course = progress.data?.course || curriculum.data.data;
  const lessons = progress.data?.lessons || curriculum.data.data.lessons;
  return (
    <>
      <section className="lms-header">
        <p className="eyebrow">My Learning</p>
        <h1>{course.title}</h1>
        <p>
          {progress.data?.completedAccessibleActivities || 0} of{' '}
          {progress.data?.totalAccessibleActivities || 0} accessible activities completed ·{' '}
          {progress.data?.progressPercent || 0}%
        </p>
        <progress max="100" value={progress.data?.progressPercent || 0} />
      </section>
      <div className="lms-lessons">
        {lessons.map((lesson) => (
          <section className="lms-lesson" key={lesson.id}>
            <p className="lesson-number">Lesson {String(lesson.lessonNumber).padStart(2, '0')}</p>
            <h2>{lesson.title}</h2>
            <p>{lesson.shortDescription}</p>
            <ol>
              {lesson.activities.map((activity) => (
                <ActivityRow activity={activity} courseSlug={courseSlug} key={activity.id} />
              ))}
            </ol>
          </section>
        ))}
      </div>
    </>
  );
};

export const StudentGuidePage = () => (
  <section className="prose-page">
    <p className="eyebrow">Student Guide</p>
    <h1>How to learn with A Plus ICT</h1>
    <h2>Sign in, select, and start free</h2>
    <p>
      Continue with Google, select your A/L ICT course, then open and complete free activities in My
      Learning.
    </p>
    <h2>Progress and locked activities</h2>
    <p>
      Progress is calculated from completed accessible activities. Locked paid activities do not
      reduce a free student’s percentage.
    </p>
    <Link className="button" to="/courses">
      View Courses
    </Link>
  </section>
);

const SitePage = ({ contact }) => {
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
      <section className="prose-page">
        <p className="eyebrow">Contact Us</p>
        <h1>Get in touch</h1>
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
        <Link className="button" to="/courses">
          View Courses
        </Link>
      </section>
    );
  return (
    <section className="prose-page about-page">
      <p className="eyebrow">About A Plus ICT</p>
      <h1>{profile.brandName}</h1>
      <p>{profile.shortDescription}</p>
      {profile.tutorResourceId && (
        <ResourceImage
          alt={profile.tutorName || 'Tutor'}
          className="about-tutor-image"
          resourceId={profile.tutorResourceId}
        />
      )}
      {profile.tutorName && (
        <>
          <h2>{profile.tutorName}</h2>
          <p>{profile.tutorTitle}</p>
          <p>{profile.tutorBio}</p>
        </>
      )}
      <SocialLinks links={profile.socialLinks} />
      <Link className="button" to="/courses">
        View Courses
      </Link>
    </section>
  );
};
export const AboutPage = () => <SitePage />;
export const ContactPage = () => <SitePage contact />;
