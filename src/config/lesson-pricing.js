import { academicAreaForCourse } from '../utils/academic-course.js';

export { academicAreaForCourse };

const lessonPricesByArea = {
  AL: 2800,
  OL: 2200,
  SCHOOL: 1800
};

const lessonPricesByGrade = {
  6: 1400,
  7: 1500,
  8: 1600,
  9: 1700
};

export const lessonPriceFor = ({ area, course, product } = {}) => {
  const apiPrice = Number(product?.price ?? product?.amount ?? product?.unitPrice);
  if (Number.isFinite(apiPrice) && apiPrice > 0) return apiPrice;
  const grade = Number(course?.grade || String(course?.academicLevel?.code || '').match(/GRADE_(\d+)/)?.[1]);
  if (lessonPricesByGrade[grade]) return lessonPricesByGrade[grade];
  return lessonPricesByArea[area || academicAreaForCourse(course)] || null;
};

export const formatLkr = (amount) => Number.isFinite(Number(amount)) && Number(amount) > 0
  ? new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(Number(amount)).replace('LKR', 'LKR')
  : null;

export const bilingualLessonPriceLabel = (amount) => ({
  english: 'Lesson price',
  sinhala: 'පාඩම් ගාස්තුව',
  value: formatLkr(amount)
});

export const lessonPurchaseText = ({ area, course, product } = {}) => {
  const amount = formatLkr(lessonPriceFor({ area, course, product }));
  return amount ? `Buy This Lesson – ${amount}` : 'Buy This Lesson';
};
