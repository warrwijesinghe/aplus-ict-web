import { expect, test } from 'vitest';
import { academicAreaForCourse, courseBreadcrumbs, mediumForCourse, normalizeMedium } from '../src/utils/academic-course.js';

test('normalizes API medium aliases consistently', () => {
  expect(normalizeMedium('Sinhala')).toBe('si');
  expect(normalizeMedium('en')).toBe('en');
  expect(mediumForCourse({ medium: { code: 'english' } })).toBe('en');
});

test('creates breadcrumbs from the actual academic area and grade', () => {
  const course = { slug: 'grade-7-ict-si', grade: 7, medium: { code: 'si' } };
  expect(academicAreaForCourse(course)).toBe('SCHOOL');
  expect(courseBreadcrumbs(course)).toEqual([
    { label: 'Home', path: '/' },
    { label: 'Grades 6–9', path: '/school-ict' },
    { label: 'Grade 7 ICT' },
    { label: 'Sinhala Medium' }
  ]);
});
