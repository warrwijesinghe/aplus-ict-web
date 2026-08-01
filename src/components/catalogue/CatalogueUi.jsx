import { Link } from 'react-router-dom';

export const BilingualHeading = ({ as = 'h2', english, sinhala }) => {
  const content = <>
    <span>{english}</span>
    {sinhala ? <small lang="si">{sinhala}</small> : null}
  </>;
  return as === 'h1' ? <h1 className="bilingual-heading">{content}</h1> : <h2 className="bilingual-heading">{content}</h2>;
};

export const MediumBadge = ({ medium }) => (
  <span className="medium-badge" lang={medium?.code === 'sinhala' ? 'si' : undefined}>
    {medium?.nameEn || medium?.name || medium?.code}
    {medium?.nameSi ? <small>{medium.nameSi}</small> : null}
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

export const ActiveCourseCard = ({ course, continueLearning }) => (
  <article className="path-card active-path-card">
    <div className="path-card-topline">
      <MediumBadge medium={course.medium} />
      <AvailabilityBadge status={course.availabilityStatus} />
    </div>
    <h3>{course.titleEn || course.title}</h3>
    {course.titleSi ? <p className="sinhala-copy" lang="si">{course.titleSi}</p> : null}
    <p>{course.shortDescriptionEn || course.shortDescription}</p>
    <p className="course-facts">
      {course.syllabusLessonCount ?? '—'} real lessons · {course.freeContentCount ?? 0} free content items
    </p>
    <div className="path-card-actions">
      <Link className="button" to={`/courses/${course.slug}`}>
        {continueLearning ? 'Continue My Learning' : 'Start Learning Free'}
      </Link>
      <Link className="button secondary" to={`/courses/${course.slug}`}>View Course</Link>
    </div>
  </article>
);

export const CatalogueCourseCard = ({ course }) => {
  const comingSoon = course.availabilityStatus === 'coming_soon';
  const image = course.medium?.code === 'sinhala'
    ? '/images/al-ict-sinhala.jfif'
    : course.medium?.code === 'english'
      ? '/images/al-ict-english.jpg'
      : '/images/course-card-default.jpg';
  return (
    <article className={`catalogue-course-card ${course.academicLevel?.code === 'AL' ? 'al-priority' : ''}`}>
      <img
        alt={`${course.titleEn || course.title} course cover`}
        className="catalogue-course-image"
        loading="lazy"
        src={image}
      />
      <div className="path-card-topline"><MediumBadge medium={course.medium} /><AvailabilityBadge status={course.availabilityStatus} /></div>
      <h3>{course.titleEn || course.title}</h3>
      {course.titleSi ? <p className="sinhala-copy" lang="si">{course.titleSi}</p> : null}
      <p>{course.shortDescriptionEn || course.shortDescription}</p>
      {!comingSoon && course.syllabusLessonCount != null ? <p className="course-facts">{course.syllabusLessonCount} published lessons</p> : null}
      <Link className="button secondary" to={`/courses/${course.slug}`}>View Course</Link>
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
