import { Link } from 'react-router-dom';
import { EmptyState, LoadingSkeleton } from '../common/States.jsx';
import { LessonPrice } from '../pricing/LessonPrice.jsx';
import { academicAreaForCourse } from '../../utils/academic-course.js';

// The route supplies access state and protected content; all courses reuse this view.
export const LessonPageTemplate = ({ course, lesson, courseSlug, isAuthenticated, enrollment, returnTo, navigation, topics, unlockAction }) => {
  const topicCount = lesson.topics?.length || 0;
  if (!isAuthenticated) return (
    <section className="login-cta">
      <p className="eyebrow">Student sign in</p>
      <h1>{lesson.title}</h1>
      <p>{lesson.descriptionEn || lesson.shortDescription || 'Sign in to open this lesson and save your progress.'}</p>
      <p>{topicCount} topics · {lesson.freeContentCount || 0} free items · {lesson.paidContentCount || 0} locked items</p>
      {lesson.topics?.length ? <ul className="lesson-topic-preview">{lesson.topics.map((topic) => <li key={topic.id}>{topic.title}</li>)}</ul> : null}
      <a className="button" href={`/login?returnTo=${encodeURIComponent(returnTo)}`}>Sign in with your phone to Start This Lesson</a>
    </section>
  );
  if (enrollment.isPending) return <LoadingSkeleton label="Checking lesson access" />;
  if (!enrollment.data) return (
    <section className="login-cta">
      <p className="eyebrow">Free enrollment</p><h1>Enroll Free to Open Available Lesson Content</h1>
      <p>Enroll once to open the available content and begin this lesson.</p>
      <Link className="button" to={`/enroll/${courseSlug}?returnTo=${encodeURIComponent(returnTo)}`}>Enroll Free and Start This Lesson</Link>
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
        {!lesson.premiumUnlocked && lesson.unlockProduct ? unlockAction : null}
      </section>
      <div className="public-lesson-layout">
        <aside className="lesson-navigation-stack" aria-label="Lesson navigation">{navigation}</aside>
        <section className="topic-learning-area" aria-label="Lesson topics">
          {lesson.topics?.length ? topics : <EmptyState title="Lesson content is being prepared" />}
        </section>
      </div>
    </div>
  );
};
