import { expect, test } from 'vitest';
import { academicAreaForCourse, formatLkr, lessonPriceFor } from '../src/config/lesson-pricing.js';

test('uses the published price for every academic area when a lesson has no product price', () => {
  expect(lessonPriceFor({ area: 'AL' })).toBe(2800);
  expect(lessonPriceFor({ area: 'OL' })).toBe(2200);
  expect(lessonPriceFor({ course: { academicLevel: { code: 'GRADE_6' } } })).toBe(1400);
  expect(lessonPriceFor({ course: { academicLevel: { code: 'GRADE_7' } } })).toBe(1500);
  expect(lessonPriceFor({ course: { academicLevel: { code: 'GRADE_8' } } })).toBe(1600);
  expect(lessonPriceFor({ course: { academicLevel: { code: 'GRADE_9' } } })).toBe(1700);
  expect(formatLkr(lessonPriceFor({ area: 'AL' }))).toBe('LKR 2,800');
});

test('uses a valid API price and never returns a zero or invalid price', () => {
  const course = { academicLevel: { code: 'AL' } };
  expect(academicAreaForCourse(course)).toBe('AL');
  expect(lessonPriceFor({ course, product: { price: 2750 } })).toBe(2750);
  expect(lessonPriceFor({ course, product: { price: 0 } })).toBe(2800);
  expect(lessonPriceFor({ area: 'UNKNOWN' })).toBeNull();
});
