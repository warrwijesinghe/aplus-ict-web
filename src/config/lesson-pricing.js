import { academicAreaForCourse } from '../utils/academic-course.js';

export { academicAreaForCourse };

export const lessonPriceFor = ({ product } = {}) => {
  const apiPrice = Number(product?.price ?? product?.amount ?? product?.unitPrice);
  if (Number.isFinite(apiPrice) && apiPrice > 0) return apiPrice;
  return null;
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
