import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, test } from 'vitest';
import { CoursePageTemplate } from '../src/components/courses/CoursePageTemplate.jsx';
import { courseCardImage } from '../src/utils/course-image.js';

const show = (course, props = {}) => render(<MemoryRouter><CoursePageTemplate course={course} renderLesson={(lesson) => <h3>{lesson.title}</h3>} {...props} /></MemoryRouter>);

test.each([
  { slug: 'grade-6-ict-english', title: 'Grade 6 ICT', medium: 'English', courseGroup: 'SCHOOL' },
  { slug: 'ol-ict-english', title: 'O/L ICT', medium: { code: 'english' }, courseGroup: 'OL' },
  { slug: 'al-ict-sinhala', title: 'A/L ICT', titleSi: 'උසස් පෙළ ICT', medium: { code: 'sinhala' }, courseGroup: 'AL', imageUrl: '/course-cover.jpg' }
])('uses the same template and matching card image for $slug', (course) => {
  show(course, { lessons: [{ id: 'lesson-1', title: 'First published lesson' }] });
  const title = course.titleSi || course.title;
  expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
  const hero = document.querySelector('.shared-page-hero');
  expect(within(hero).getAllByRole('img')[0]).toHaveAttribute('src', courseCardImage(course));
  expect(screen.getByRole('link', { name: 'Explore Lessons' })).toHaveAttribute('href', '#course-syllabus');
  expect(screen.queryByRole('link', { name: /enroll/i })).not.toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'About this course' })).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'First published lesson' })).toBeInTheDocument();

});

test('keeps only Explore Lessons even for an enrolled student and supports an empty curriculum', () => {
  show({ slug: 'grade-6-ict-english', title: 'Grade 6 ICT', medium: 'English' }, { isAuthenticated: true, isEnrolled: true });
  expect(screen.queryByRole('link', { name: 'Continue Learning' })).not.toBeInTheDocument();
  expect(screen.getByText('Syllabus lessons will be published soon')).toBeInTheDocument();
});
