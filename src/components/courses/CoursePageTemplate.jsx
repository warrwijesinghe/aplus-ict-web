import { Link } from 'react-router-dom';
import { PageHero } from '../common/PageHero.jsx';
import { EmptyState } from '../common/States.jsx';
import { academicAreaDetails, courseBreadcrumbs, mediumForCourse } from '../../utils/academic-course.js';
import { courseCardImage } from '../../utils/course-image.js';

// Presentation only: the route supplies API data and the existing lesson renderer.
export const CoursePageTemplate = ({ course, lessons = [], renderLesson }) => {
  const sinhala = mediumForCourse(course) === 'si';
  const title = (sinhala ? course.titleSi || course.title || course.titleEn : course.titleEn || course.title || course.titleSi) || 'ICT course';
  const description = (sinhala ? course.shortDescriptionSi || course.shortDescription || course.shortDescriptionEn : course.shortDescriptionEn || course.shortDescription || course.shortDescriptionSi) || course.description || 'Explore the lessons and learning content available in this course.';
  const levelLabel = course.academicLevel?.nameEn || academicAreaDetails(course).label;
  const mediumLabel = typeof course.medium === 'string' ? course.medium : course.medium?.nameEn || course.medium?.name || (mediumForCourse(course) === 'si' ? 'Sinhala Medium' : mediumForCourse(course) === 'en' ? 'English Medium' : '');
  return (
    <>
      <PageHero titleId="course-hero-title" images={[
        { src: courseCardImage(course), alt: course.title + ' course cover' },
        ...['lesson-webinar-notes', 'lesson-study', 'headset-class', 'focused-student'].map((image, index) => ({ src: '/images/learning-places/' + image + '.webp', alt: ['Student taking lesson notes', 'Student reviewing course material', 'Student attending an online class', 'Student preparing for ICT lessons'][index] }))
      ]}>
          <p className="eyebrow">{levelLabel} · {mediumLabel}</p>
          <h1 id="course-hero-title" lang={sinhala ? 'si' : undefined}>{title}</h1>
          <p className="course-detail-description">{description}</p>
          <div className="course-detail-actions hero-actions"><a className="button" href="#course-syllabus">Explore Lessons</a></div>
      </PageHero>

      <nav aria-label="Breadcrumb" className="breadcrumbs">{courseBreadcrumbs(course).map((item, index) => <span key={`${item.label}-${index}`}>{index ? <span aria-hidden="true">/</span> : null}{item.path ? <Link to={item.path}>{item.label}</Link> : <span>{item.label}</span>}</span>)}</nav>
      <section className="syllabus-summary" id="course-syllabus">
        
        <p className="eyebrow">Course lessons</p>
        <h2>Learn lesson by lesson</h2>
        <p className="syllabus-intro">
          Start learning for free and unlock the complete lesson when available.
        </p>
        {lessons.length ? (
          <div className="syllabus-lesson-grid">
            {lessons.map((lesson) => <div className="course-template-lesson" key={lesson.id}>{renderLesson(lesson)}</div>)}
          </div>
        ) : (
          <EmptyState title="Syllabus lessons will be published soon" />
        )}
      </section>
    </>
  );
};
