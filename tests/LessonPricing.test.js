import { expect, test } from 'vitest';
import { academicAreaForCourse, formatLkr, lessonPriceFor } from '../src/config/lesson-pricing.js';

test('does not invent a price when commerce has not supplied a product', () => {
  expect(lessonPriceFor({ area: 'SCHOOL' })).toBeNull();
  expect(formatLkr(lessonPriceFor({ area: 'AL' }))).toBeNull();
});

test('uses a valid API price and never returns a zero or invalid price', () => {
  const course = { academicLevel: { code: 'AL' } };
  expect(academicAreaForCourse(course)).toBe('AL');
  expect(lessonPriceFor({ course, product: { price: 2750 } })).toBe(2750);
  expect(lessonPriceFor({ course, product: { price: 0 } })).toBeNull();
  expect(lessonPriceFor({ area: 'UNKNOWN' })).toBeNull();
});
