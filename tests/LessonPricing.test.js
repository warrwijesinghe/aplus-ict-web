import { expect, test } from 'vitest';
import { LESSON_PRICE_LKR, academicAreaForCourse, formatLkr, lessonPriceFor } from '../src/config/lesson-pricing.js';

test('uses the confirmed fallback lesson prices for each academic area', () => {
  expect(LESSON_PRICE_LKR).toEqual({ SCHOOL: 1500, OL: 2000, AL: 2500 });
  expect(formatLkr(lessonPriceFor({ area: 'SCHOOL' }))).toContain('1,500');
  expect(formatLkr(lessonPriceFor({ area: 'OL' }))).toContain('2,000');
  expect(formatLkr(lessonPriceFor({ area: 'AL' }))).toContain('2,500');
});

test('uses a valid API price and never returns a zero or invalid price', () => {
  const course = { academicLevel: { code: 'AL' } };
  expect(academicAreaForCourse(course)).toBe('AL');
  expect(lessonPriceFor({ course, product: { price: 2750 } })).toBe(2750);
  expect(lessonPriceFor({ course, product: { price: 0 } })).toBe(2500);
  expect(lessonPriceFor({ area: 'UNKNOWN' })).toBeNull();
});
