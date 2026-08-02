import { Link } from 'react-router-dom';
import { trackPublicEvent } from '../../analytics/events.js';
import { gradeForCourse, mediumForCourse } from '../../utils/academic-course.js';

export const BilingualHeading = ({ as = 'h2', english, sinhala }) => {
  const content = <>
    <span>{english}</span>
    {sinhala ? <small lang="si">{sinhala}</small> : null}
  </>;
  return as === 'h1' ? <h1 className="bilingual-heading">{content}</h1> : <h2 className="bilingual-heading">{content}</h2>;
};

const isSinhalaMedium = (course = {}) => mediumForCourse(course) === 'si';

const primaryCourseTitle = (course = {}) => (
  isSinhalaMedium(course)
    ? course.titleSi || course.title || course.titleEn
    : course.titleEn || course.title || course.titleSi
);

const gradeLabel = (course = {}) => {
  const grade = gradeForCourse(course);
  if (grade) return `Grade ${grade}`;
  if (course.academicLevel?.code === 'AL') return 'Grades 12–13';
  if (course.academicLevel?.code === 'OL') return 'Grades 10–11';
  return 'School ICT';
};

const GlobeIcon = () => (
  <svg aria-hidden="true" fill="none" focusable="false" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.8 12h16.4M12 3.5c2.1 2.3 3.2 5.1 3.2 8.5S14.1 18.2 12 20.5C9.9 18.2 8.8 15.4 8.8 12S9.9 5.8 12 3.5Z" />
  </svg>
);

const BookIcon = () => (
  <svg aria-hidden="true" fill="none" focusable="false" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" viewBox="0 0 24 24">
    <path d="M4.5 5.5A2.5 2.5 0 0 1 7 3h4.5v16H7a2.5 2.5 0 0 0-2.5 2.5v-16ZM19.5 5.5A2.5 2.5 0 0 0 17 3h-4.5v16H17a2.5 2.5 0 0 1 2.5 2.5v-16Z" />
  </svg>
);

const MonitorIcon = () => (
  <svg aria-hidden="true" fill="none" focusable="false" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" viewBox="0 0 24 24">
    <rect height="12" rx="1.5" width="17" x="3.5" y="3.5" />
    <path d="m10 8 4 2.5-4 2.5V8ZM9 20.5h6M12 15.5v5" />
  </svg>
);

const ChartIcon = () => (
  <svg aria-hidden="true" fill="none" focusable="false" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" viewBox="0 0 24 24">
    <path d="M4 20.5V4.5M4 20.5h16" />
    <path d="M8 17v-4M12 17V8M16 17v-7" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg aria-hidden="true" fill="none" focusable="false" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const MediumBadge = ({ medium }) => {
  const sinhala = ['sinhala', 'si'].includes(String(medium?.code || '').toLowerCase());
  const label = sinhala
    ? medium?.nameSi || 'සිංහල මාධ්‍ය'
    : medium?.nameEn || medium?.name || medium?.code || 'English Medium';

  return <span className={`course-medium-badge ${sinhala ? 'is-sinhala' : 'is-english'}`} lang={sinhala ? 'si' : undefined}>
    <GlobeIcon />
    {label}
  </span>;
};

const statusDescription = (value) => /\b(coming soon|upcoming|published|free content availability)\b|ඉදිරියේදී/i.test(String(value || ''));

const fallbackDescription = (course) => {
  const grade = gradeForCourse(course);
  if (isSinhalaMedium(course)) {
    if (grade === '10') return 'O/L ICT දැනුම ක්‍රමානුකූල පාඩම්, ප්‍රායෝගික ක්‍රියාකාරකම් සහ ඉලක්කගත පුනරීක්ෂණය සමඟ ගොඩනගන්න.';
    if (grade === '11') return 'O/L විභාගයට අවශ්‍ය ICT දැනුම, ප්‍රායෝගික පුහුණුව සහ ඉලක්කගත පුනරීක්ෂණය සමඟ සම්පූර්ණ කරන්න.';
    return 'ක්‍රමානුකූල පාඩම්, ප්‍රායෝගික ක්‍රියාකාරකම් සහ පුනරීක්ෂණය සමඟ ICT දැනුම ගොඩනගන්න.';
  }
  return grade === '10'
    ? 'Build strong O/L ICT knowledge through structured lessons, practical activities, and exam-focused revision.'
    : 'Build ICT knowledge through structured lessons, practical activities, and exam-focused revision.';
};

const descriptionForCourse = (course) => {
  const description = isSinhalaMedium(course)
    ? course.shortDescriptionSi || course.shortDescription || course.shortDescriptionEn
    : course.shortDescriptionEn || course.shortDescription || course.shortDescriptionSi;
  return description && !statusDescription(description) ? description : fallbackDescription(course);
};

const defaultHighlights = (course) => (
  isSinhalaMedium(course)
    ? ['සම්පූර්ණ පාඩම් ලැයිස්තුව', 'ප්‍රායෝගික ක්‍රියාකාරකම්', 'විභාගයට ඉලක්කගත පුනරීක්ෂණය']
    : ['Complete lesson list', 'Practical activities', 'Exam-focused revision']
);

const highlightsForCourse = (course) => {
  const supplied = Array.isArray(course.highlights)
    ? course.highlights
      .map((highlight) => typeof highlight === 'string' ? highlight : highlight?.label || highlight?.title || highlight?.text)
      .filter(Boolean)
      .slice(0, 3)
    : [];
  return supplied.length ? supplied : defaultHighlights(course);
};

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

const courseImage = (area, course) => {
  const imagePool = courseImagePools[area] || courseImagePools.AL;
  return course.imageUrl || course.image?.url || course.coverImageUrl || course.coverImage?.url
    || imagePool[stableImageIndex(course.slug || course.id || primaryCourseTitle(course), imagePool.length)];
};

export const CourseHighlights = ({ course }) => {
  const icons = [BookIcon, MonitorIcon, ChartIcon];
  return <ul className="course-highlights">
    {highlightsForCourse(course).map((highlight, index) => {
      const Icon = icons[index] || BookIcon;
      return <li key={`${highlight}-${index}`}><span className="course-highlight-icon"><Icon /></span><span>{highlight}</span></li>;
    })}
  </ul>;
};

export const CatalogueCourseCard = ({ area, course }) => {
  const title = primaryCourseTitle(course) || 'ICT course';
  const route = course.slug ? `/courses/${course.slug}` : '/courses';
  const sinhala = isSinhalaMedium(course);

  return (
    <article className="catalogue-course-card">
      <img
        alt={`${title} course cover`}
        className="catalogue-course-image"
        height="240"
        loading="lazy"
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = '/images/course-card-default.jpg';
        }}
        src={courseImage(area, course)}
        width="400"
      />
      <div className="catalogue-course-content">
        <MediumBadge medium={course.medium} />
        <p className="course-grade">{gradeLabel(course)}</p>
        <h3 lang={sinhala ? 'si' : undefined}>{title}</h3>
        <p className="course-description" lang={sinhala ? 'si' : undefined}>{descriptionForCourse(course)}</p>
        <CourseHighlights course={course} />
        <Link className="button secondary catalogue-course-cta" onClick={() => trackPublicEvent('course_card_opened', { course_slug: course.slug })} to={route}>
          <span>View Course</span><ArrowRightIcon />
        </Link>
      </div>
    </article>
  );
};

export const ActiveCourseCard = ({ course, continueLearning }) => (
  <article className="path-card active-path-card">
    <MediumBadge medium={course.medium} />
    <p className="course-grade">{gradeLabel(course)}</p>
    <h3 lang={isSinhalaMedium(course) ? 'si' : undefined}>{primaryCourseTitle(course)}</h3>
    <p>{descriptionForCourse(course)}</p>
    <div className="path-card-actions">
      <Link className="button" to={`/courses/${course.slug}`}>
        {continueLearning ? 'Continue My Learning' : 'View Course'}
      </Link>
    </div>
  </article>
);

export const GradeCourseGroup = ({ level, courses }) => (
  <article className="grade-roadmap-card">
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
