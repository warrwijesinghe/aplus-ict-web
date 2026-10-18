import { academicAreaForCourse, mediumForCourse } from './academic-course.js';

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
  ],
  DEGREE: ['/images/learning-places/campus-steps.webp'],
  PROFESSIONAL: ['/images/learning-places/lesson-laptop-focus.webp'],
  SHORT_COURSES: ['/images/learning-places/practical-learning.webp']
};

const stableImageIndex = (value, length) => [...String(value || '')]
  .reduce((total, character) => total + character.charCodeAt(0), 0) % length;

export const courseCardImage = (course = {}, area) => {
  const imagePool = courseImagePools[area || course.courseGroup || academicAreaForCourse(course)] || courseImagePools.AL;
  return course.imageUrl || course.image?.url || course.coverImageUrl || course.coverImage?.url
    || imagePool[stableImageIndex(course.slug || course.id || (mediumForCourse(course) === 'si' ? course.titleSi || course.title || course.titleEn : course.titleEn || course.title || course.titleSi), imagePool.length)];
};

