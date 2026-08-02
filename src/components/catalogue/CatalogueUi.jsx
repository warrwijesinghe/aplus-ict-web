import { Link } from 'react-router-dom';
import { trackPublicEvent } from '../../analytics/events.js';
import { LessonPrice } from '../pricing/LessonPrice.jsx';
import { gradeForCourse, mediumForCourse } from '../../utils/academic-course.js';

export const BilingualHeading = ({ as = 'h2', english, sinhala }) => {
  const content = <>
    <span>{english}</span>
    {sinhala ? <small lang="si">{sinhala}</small> : null}
  </>;
  return as === 'h1' ? <h1 className="bilingual-heading">{content}</h1> : <h2 className="bilingual-heading">{content}</h2>;
};

export const MediumBadge = ({ medium }) => (
  <span className="medium-badge" lang={['sinhala', 'si'].includes(String(medium?.code || '').toLowerCase()) ? 'si' : undefined}>
    {['sinhala', 'si'].includes(String(medium?.code || '').toLowerCase()) ? medium?.nameSi || 'සිංහල මාධ්‍යය' : medium?.nameEn || medium?.name || medium?.code}
  </span>
);

export const AvailabilityBadge = ({ status }) => {
  const comingSoon = status === 'coming_soon';
  return (
    <span className={`availability-badge ${comingSoon ? 'coming-soon' : 'active'}`}>
      {comingSoon ? 'Coming Soon · ළඟදීම' : 'Available now · දැන් ලබාගත හැක'}
    </span>
  );
};

const isSinhalaMedium = (course) => mediumForCourse(course) === 'si';
const primaryCourseTitle = (course) => isSinhalaMedium(course)
  ? course.titleSi || course.title
  : course.titleEn || course.title;
const gradeLabel = (course) => {
  const grade = gradeForCourse(course);
  if (grade) return `Grade ${grade}`;
  if (course.academicLevel?.code === 'AL') return 'Grades 12–13';
  if (course.academicLevel?.code === 'OL') return 'Grades 10–11';
  return null;
};

export const ActiveCourseCard = ({ course, continueLearning }) => (
  <article className="path-card active-path-card">
    <div className="path-card-topline">
      <MediumBadge medium={course.medium} />
      <AvailabilityBadge status={course.availabilityStatus} />
    </div>
    <p className="course-grade">{gradeLabel(course) || 'School ICT'}</p>
    <h3 lang={isSinhalaMedium(course) ? 'si' : undefined}>{primaryCourseTitle(course)}</h3>
    <p>{course.shortDescriptionEn || course.shortDescription}</p>
    <p className="course-facts">
      {course.syllabusLessonCount ? `${course.syllabusLessonCount} published lessons` : 'Course content coming soon'} · {course.freeContentCount ?? 0} free content items
    </p>
    <div className="path-card-actions">
      <Link className="button" to={`/courses/${course.slug}`}>
        {continueLearning ? 'Continue My Learning' : 'View available content'}
      </Link>
    </div>
  </article>
);

const courseImagePools = {
  SCHOOL: [
    '/images/learning-places/school-desk.webp',
    '/images/learning-places/school-online-learning.webp',
    '/images/learning-places/lesson-tablet-headphones.webp',
    '/images/learning-places/lesson-laptop-focus.webp'
  ],
  OL: [
    '/images/learning-places/study-desk.webp',
    '/images/learning-places/ol-online-learning.webp',
    '/images/learning-places/lesson-headset-laptop.webp',
    '/images/learning-places/lesson-study-notes.webp'
  ],
  AL: [
    '/images/learning-places/lesson-study.webp',
    '/images/learning-places/al-online-learning.webp',
    '/images/learning-places/lesson-focused-study.webp',
    '/images/learning-places/lesson-cafe-learning.webp'
  ]
};

const stableImageIndex = (value, length) => [...String(value || '')]
  .reduce((total, character) => total + character.charCodeAt(0), 0) % length;

export const CatalogueCourseCard = ({ area, course }) => {
  const imagePool = courseImagePools[area] || courseImagePools.AL;
  const image = imagePool[stableImageIndex(course.slug || course.id || primaryCourseTitle(course), imagePool.length)];
  return (
    <article className={`catalogue-course-card ${course.academicLevel?.code === 'AL' ? 'al-priority' : ''}`}>
      <img
        alt={`${primaryCourseTitle(course)} course cover`}
        className="catalogue-course-image"
        height="240"
        loading="lazy"
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = '/images/course-card-default.jpg';
        }}
        src={image}
        width="400"
      />
      <div className="path-card-topline"><MediumBadge medium={course.medium} /><AvailabilityBadge status={course.availabilityStatus} /></div>
      <p className="course-grade">{gradeLabel(course) || 'School ICT'}</p>
      <h3 lang={isSinhalaMedium(course) ? 'si' : undefined}>{primaryCourseTitle(course)}</h3>
      <p>{course.shortDescriptionEn || course.shortDescription}</p>
      <p className="course-facts">{course.syllabusLessonCount ? `${course.syllabusLessonCount} published lessons` : 'Course content coming soon'} · {course.freeContentCount ? 'Free content available' : 'Free content availability will be shown when published'}</p>
      <LessonPrice area={area} course={course} />
      <Link className="button secondary" onClick={() => trackPublicEvent('course_card_opened', { course_slug: course.slug })} to={`/courses/${course.slug}`}>View Course</Link>
    </article>
  );
};

export const GradeCourseGroup = ({ level, courses }) => (
  <article className="grade-roadmap-card">
    <AvailabilityBadge status="coming_soon" />
    <h3>{level?.nameEn}</h3>
    <p className="sinhala-copy" lang="si">{level?.nameSi}</p>
    <div className="grade-mediums">
      {courses.map((course) => <MediumBadge key={course.id} medium={course.medium} />)}
    </div>
    <Link className="text-link" to={`/school-ict/${level?.code?.toLowerCase().replace('_', '-')}`}>
      View Course Plan <span aria-hidden="true">→</span>
    </Link>
  </article>
);
