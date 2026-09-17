import { Link } from 'react-router-dom';
import { trackPublicEvent } from '../../analytics/events.js';
import { gradeForCourse, mediumForCourse } from '../../utils/academic-course.js';
import { courseImageFor } from '../../utils/course-image.js';

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
  return description && !/\b(coming soon|upcoming|published|free content availability)\b|ඉදිරියේදී/i.test(String(description))
    ? description
    : fallbackDescription(course);
};

export const CatalogueCourseCard = ({ area, course }) => {
  const title = primaryCourseTitle(course) || 'ICT course';
  const route = course.slug ? `/courses/${course.slug}` : '/courses';
  const sinhala = isSinhalaMedium(course);
  const description = descriptionForCourse(course);

  return (
    <article className={`catalogue-course-card ${sinhala ? 'is-sinhala' : 'is-english'}`}>
      <Link aria-label={`Open ${title}`} className="catalogue-course-link" onClick={() => trackPublicEvent('course_card_opened', { course_slug: course.slug })} to={route}>
        <div className="catalogue-course-image-frame">
          <img
            alt={`${title} course cover`}
            className="catalogue-course-image"
            height="360"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = '/images/course-card-default.jpg';
            }}
            src={courseImageFor(course, area)}
            width="600"
          />
          <div className="catalogue-course-image-labels">
            <span className="catalogue-course-grade">{gradeLabel(course)}</span>
            <MediumBadge medium={course.medium} />
          </div>
        </div>
        <div className="catalogue-course-content">
          <h3 lang={sinhala ? 'si' : undefined}>{title}</h3>
          <p lang={sinhala ? 'si' : undefined}>{description}</p>
        </div>
      </Link>
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
