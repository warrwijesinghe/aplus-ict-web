// Commerce products should ultimately provide every public lesson price. Until
// then, this single mapping keeps the confirmed academic-area prices consistent.
export const LESSON_PRICE_LKR = Object.freeze({
  SCHOOL: 1500,
  OL: 2000,
  AL: 2500
});

export const academicAreaForCourse = (course = {}) => {
  const level = String(course.courseGroup || course.academicLevel?.code || course.academicLevel || '').toUpperCase();
  const slug = String(course.slug || '').toLowerCase();
  if (level === 'AL' || slug.startsWith('al-')) return 'AL';
  if (level === 'OL' || slug.startsWith('ol-') || /GRADE_?(10|11)/.test(level)) return 'OL';
  if (level === 'SCHOOL' || /GRADE_?[6-9]/.test(level) || slug.startsWith('grade-')) return 'SCHOOL';
  return null;
};

export const lessonPriceFor = ({ area, course, product } = {}) => {
  const apiPrice = Number(product?.price ?? product?.amount ?? product?.unitPrice);
  if (Number.isFinite(apiPrice) && apiPrice > 0) return apiPrice;
  return LESSON_PRICE_LKR[area || academicAreaForCourse(course)] || null;
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
