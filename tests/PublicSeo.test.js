import { expect, test } from 'vitest';
import { PUBLIC_SITEMAP_PATHS, absoluteUrl, courseSeo, normalizePath } from '../src/seo/public-seo-config.js';

test('normalizes canonical paths and strips filter query parameters', () => {
  expect(normalizePath('/ol-ict/')).toBe('/ol-ict');
  expect(absoluteUrl('/ol-ict', 'https://example.test/')).toBe('https://example.test/ol-ict');
});

test('the static sitemap covers all academic pathways and excludes the legacy catalogue route', () => {
  expect(PUBLIC_SITEMAP_PATHS).toEqual(expect.arrayContaining(['/school-ict', '/ol-ict', '/al-ict']));
  expect(PUBLIC_SITEMAP_PATHS).not.toContain('/courses');
});

test('course metadata selects the matching medium title without inventing statistics', () => {
  expect(courseSeo({ title: 'Fallback', titleSi: 'සිංහල පාඨමාලාව', titleEn: 'English Course', medium: { code: 'sinhala', nameEn: 'Sinhala Medium' } }).title).toContain('සිංහල පාඨමාලාව');
  expect(courseSeo({ title: 'Fallback', titleSi: 'සිංහල පාඨමාලාව', titleEn: 'English Course', medium: { code: 'english', nameEn: 'English Medium' } }).title).toContain('English Course');
});
