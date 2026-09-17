import { gradeForCourse } from './academic-course.js';

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
    '/images/learning-places/study-anywhere-student.jpg',
    '/images/learning-places/cafe-laptop.webp',
    '/images/learning-places/home-study-notes.webp',
    '/images/learning-places/lesson-laptop-focus.webp'
  ]
};

const imageAreaForCourse = (course = {}) => {
  const level = String(course.academicLevel?.code || '').toUpperCase();
  const grade = Number(gradeForCourse(course));
  if (level === 'OL' || (grade >= 10 && grade <= 11)) return 'OL';
  if (level === 'SCHOOL' || (grade >= 6 && grade <= 9)) return 'SCHOOL';
  return 'AL';
};

const stableImageIndex = (value, length) => [...String(value || '')]
  .reduce((total, character) => total + character.charCodeAt(0), 0) % length;

export const courseImageFor = (course = {}, area) => {
  const imagePool = courseImagePools[area || imageAreaForCourse(course)] || courseImagePools.AL;
  const title = course.titleSi || course.titleEn || course.title || 'course';
  return course.imageUrl || course.image?.url || course.coverImageUrl || course.coverImage?.url
    || imagePool[stableImageIndex(course.slug || course.id || title, imagePool.length)];
};
