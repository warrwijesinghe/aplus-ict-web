import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation, useParams } from 'react-router-dom';
import { contentApi } from '../api/content.api.js';
import { learningApi } from '../api/learning.api.js';
import { serviceUrls } from '../api/service-urls.js';
import { queryKeys } from '../api/query-keys.js';
import { EmptyState, InlineError, LoadingSkeleton } from '../components/common/States.jsx';
import { ResourceImage } from '../components/resources/ResourceImage.jsx';
import { useAuth } from '../auth/auth-context.jsx';

const CourseCard = ({ course }) => (
  <article className="public-course-card">
    <ResourceImage alt={course.title} resourceId={course.thumbnailResourceId} />
    <div>
      <p className="eyebrow">{course.medium?.name || course.medium?.code}</p>
      <h2>{course.title}</h2>
      <p>{course.shortDescription}</p>
      <p className="course-counts">
        <span>{course.syllabusLessonCount} lessons</span>
        <span>{course.freeActivityCount} free activities</span>
      </p>
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

export const PublicHomePage = () => (
  <>
    <section className="hero al-ict-hero">
      <div>
        <p className="eyebrow">A Plus ICT</p>
        <h1>A/L ICT සරලව, නිවැරදිව සහ ක්‍රමානුකූලව ඉගෙන ගන්න.</h1>
        <p>Free Lessons, Paid Learning Activities සහ Progress Tracking එකම LMS එකක් තුළ.</p>
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
    <section>
      <p className="eyebrow">A/L ICT courses</p>
      <h2>ඔබගේ medium එක තෝරන්න</h2>
      <CourseGrid />
    </section>
    <section className="home-section" id="how-it-works">
      <p className="eyebrow">How it works</p>
      <h2>Learn, practise, and track every step.</h2>
      <div className="steps-grid">
        <article>
          <span>01</span>
          <h3>Select a course</h3>
          <p>Choose your A/L ICT medium.</p>
        </article>
        <article>
          <span>02</span>
          <h3>Start free</h3>
          <p>Open available free learning activities.</p>
        </article>
        <article>
          <span>03</span>
          <h3>Keep progressing</h3>
          <p>Completion is recorded activity by activity.</p>
        </article>
      </div>
    </section>
    <section className="login-cta">
      <h2>Ready to start your A/L ICT learning path?</h2>
      <Link className="button" to="/courses">
        Start Learning Free
      </Link>
    </section>
  </>
);

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
  if (query.isLoading) return <LoadingSkeleton />;
  if (query.isError) return <InlineError error={query.error} />;
  const course = query.data.data;
  return (
    <>
      <section className="course-detail-hero">
        <ResourceImage alt={course.title} resourceId={course.heroResourceId} />
        <div>
          <p className="eyebrow">{course.medium?.name || course.medium?.code}</p>
          <h1>{course.title}</h1>
          <p>{course.description || course.shortDescription}</p>
          <p className="course-counts">
            <span>{course.syllabusLessonCount} lessons</span>
            <span>{course.freeActivityCount} Free</span>
            <span>{course.paidActivityCount} Paid</span>
          </p>
          <Link className="button" to={`/courses/${course.slug}/learn`}>
            Start Learning With Free Lessons
          </Link>
        </div>
      </section>
      <section>
        <h2>How the LMS works</h2>
        <p>
          Free activities are available after student sign-in. Paid activities remain in the
          learning flow and unlock only through future lesson access.
        </p>
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
    <li className={activity.isLocked ? 'lms-activity locked' : 'lms-activity'}>
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
      reduce a free student’s percentage. Paid lesson access will be introduced later.
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
  return contact ? (
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
      <Link className="button" to="/courses">
        View Courses
      </Link>
    </section>
  ) : (
    <section className="prose-page">
      <p className="eyebrow">About A Plus ICT</p>
      <h1>{profile.brandName}</h1>
      <p>{profile.shortDescription}</p>
      {profile.tutorResourceId && (
        <ResourceImage alt={profile.tutorName || 'Tutor'} resourceId={profile.tutorResourceId} />
      )}
      {profile.tutorName && (
        <>
          <h2>{profile.tutorName}</h2>
          <p>{profile.tutorTitle}</p>
          <p>{profile.tutorBio}</p>
        </>
      )}
      <Link className="button" to="/courses">
        View Courses
      </Link>
    </section>
  );
};
export const AboutPage = () => <SitePage />;
export const ContactPage = () => <SitePage contact />;
