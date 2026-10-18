import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { formatLkr, lessonPriceFor } from '../../config/lesson-pricing.js';

const mediumDetails = (value) => {
  const values = (Array.isArray(value) ? value : [value]).filter(Boolean).map((item) => typeof item === 'string' ? item : item.code || item.nameEn || item.name || '').join(' ').toLowerCase();
  const sinhala = /sinhala|\bsi\b/.test(values);
  const english = /english|\ben\b/.test(values);
  if ((sinhala && english) || /bilingual|both/.test(values)) return { label: 'Sinhala + English', tone: 'both' };
  if (sinhala) return { label: 'Sinhala Medium', tone: 'sinhala' };
  if (english) return { label: 'English Medium', tone: 'english' };
  return null;
};

export const LessonCard = ({ course = {}, courseSlug, lesson, image, isEnrolled, progress, onOpen }) => {
  const published = lesson.isPublished !== false && (!lesson.status || ['published', 'active'].includes(lesson.status));
  const available = published && lesson.availabilityStatus !== 'inactive' && lesson.availabilityStatus !== 'coming_soon' && Number(lesson.freeContentCount || 0) + Number(lesson.paidContentCount || 0) > 0;
  const price = formatLkr(lessonPriceFor({ product: lesson.unlockProduct }));
  const medium = mediumDetails(lesson.mediums || lesson.medium || course.mediums || course.medium);
  const content = <>
    <div className="lesson-card-image-frame">
      <img alt="" className="lesson-card-image" height="360" loading="lazy" src={image || lesson.imageUrl || lesson.coverImageUrl || '/images/course-card-default.jpg'} width="600" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/images/course-card-default.jpg'; }} />
      <span className={'student-lesson-status ' + (available ? 'is-available' : 'is-coming-soon')}><span aria-hidden="true" />{available ? 'Available' : 'Coming Soon'}</span>
    </div>
    <div className="lesson-card-content">
      <div className="student-lesson-meta"><span>Lesson {String(lesson.lessonNumber).padStart(2, '0')}</span>{medium && <span className={'student-lesson-medium is-' + medium.tone}><BookOpen aria-hidden="true" size={16} />{medium.label}</span>}</div>
      <h3>{lesson.title}</h3>
      {lesson.shortDescription && <p className="student-lesson-description">{lesson.shortDescription}</p>}
      {isEnrolled && available && <div className="student-lesson-progress"><label>Your progress <progress aria-label={lesson.title + ' progress'} max="100" value={progress?.progressPercent || 0} /></label></div>}
      <div className="student-lesson-bottom">
        <div className="student-lesson-price"><span>Course Price</span>{price ? <strong>{price}</strong> : <small>Price to be announced</small>}</div>
        {available ? <span className="student-lesson-cta">Start Learning Free<ArrowRight aria-hidden="true" size={20} /></span> : <button className="student-lesson-cta" disabled type="button">Coming Soon</button>}
      </div>
    </div>
  </>;
  return <article className="syllabus-lesson-card student-lesson-card">{available ? <Link className="student-lesson-link" to={'/courses/' + (courseSlug || course.slug) + '/lessons/' + (lesson.slug || lesson.id)} onClick={onOpen}>{content}</Link> : <div className="student-lesson-link">{content}</div>}</article>;
};
