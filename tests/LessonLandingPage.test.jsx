import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, test } from 'vitest';
import { LessonLanding } from '../src/pages/LessonLandingPage.jsx';

const lesson = { id: 'one', title: 'Information systems', lessonNumber: 1, freeContentCount: 2, unlockProduct: { price: 2200 }, landingPageContent: { overview: 'An overview written for visitors.', syllabus: [{ title: 'Landing page syllabus item', description: 'A public explanation of this lesson.' }] }, topics: [{ id: 'topic', title: 'Understanding information', contentItems: [{ id: 'paid', title: 'Paid activity', isLocked: true, content: 'Protected lesson text' }] }] };
const show = (overrides = {}, state = {}) => render(<MemoryRouter><LessonLanding course={{ title: 'O/L ICT', medium: 'english' }} lesson={{ ...lesson, ...overrides }} courseSlug="ol-ict" lessonSlug="information" {...state} /></MemoryRouter>);

test.each([
  { title: 'A/L ICT', courseGroup: 'AL', medium: 'english' },
  { title: 'O/L ICT', courseGroup: 'OL', medium: 'english' },
  { title: 'Grade 6 ICT', courseGroup: 'SCHOOL', medium: 'english' },
  { title: 'Professional Networking', courseGroup: 'PROFESSIONAL', medium: 'english' },
  { title: 'ICT English title', titleSi: 'හය ශ්‍රේණිය තොරතුරු තාක්ෂණය', courseGroup: 'SCHOOL', medium: 'sinhala' },
])('identifies the actual course prominently for $title', (course) => {
  render(<MemoryRouter><LessonLanding course={course} lesson={lesson} courseSlug="course" lessonSlug="lesson" /></MemoryRouter>);
  const identity = document.querySelector('.lesson-course-identity');
  expect(identity).toHaveTextContent(course.titleSi || course.title);
  expect(identity.querySelector('.lesson-course-label')).toBeNull();
});

test('keeps the chosen lesson through free enrollment and purchase enrollment', () => {
  show();
  expect(screen.getAllByRole('link', { name: /Start Learning Free Now/ })[0]).toHaveAttribute('href', '/enroll/ol-ict?returnTo=' + encodeURIComponent('/courses/ol-ict/lessons/information/learn'));
  expect(screen.getAllByRole('link', { name: /Buy Full Lesson/ })[0]).toHaveAttribute('href', '/enroll/ol-ict?returnTo=' + encodeURIComponent('/courses/ol-ict/lessons/information/exam-success-pack'));
  expect(screen.getAllByText(/2,200/).length).toBeGreaterThan(0);
  fireEvent.click(screen.getByText('Landing page syllabus item'));
  expect(screen.getByText('A public explanation of this lesson.')).toBeVisible();
  expect(screen.getByText('An overview written for visitors.')).toBeInTheDocument();
  expect(screen.queryByText('Understanding information')).not.toBeInTheDocument();
  expect(screen.queryByText('Paid activity')).not.toBeInTheDocument();
  expect(screen.queryByText('Protected lesson text')).not.toBeInTheDocument();
});

test('handles unpublished pricing and syllabus without inventing values', () => {
  show({ unlockProduct: null, landingPageContent: null });
  expect(screen.queryByRole('heading', { name: 'What you’ll learn' })).not.toBeInTheDocument();
  expect(screen.getAllByText('Price to be announced').length).toBeGreaterThan(0);
  expect(screen.queryByRole('link', { name: /Buy Full Lesson/ })).not.toBeInTheDocument();
});

test('removes FAQs and explains the two enrollment choices with simple delivery copy', () => {
  show();
  expect(screen.queryByText('A few helpful answers')).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Printed Tutorial Included' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'What you get in the LMS' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Why students choose A Plus ICT' })).toBeInTheDocument();
});

test('uses admin delivery and CTA text', () => {
  show({ landingPageContent: { tutorialTitle: 'Your printed tutorial', ctaTitle: 'Start your ICT lesson', ctaDescription: 'Choose your access below.' } });
  expect(screen.getByRole('heading', { name: 'Your printed tutorial' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Start your ICT lesson' })).toBeInTheDocument();
  expect(screen.getByText('Choose your access below.')).toBeInTheDocument();
});

test('keeps the introduction video in the content container outside the hero', () => {
  show();
  const hero = screen.getByRole('region', { name: lesson.title });
  const video = screen.getByTitle(`${lesson.title} — sample course introduction video`);
  expect(hero).not.toContainElement(video);
  expect(screen.getByRole('region', { name: 'Course introduction' })).toContainElement(video);
  expect(video).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/5bDZqG9fSXM?rel=0');
  expect(video.getAttribute('src')).not.toContain('autoplay=1');
  expect(screen.queryByRole('link', { name: /Watch on YouTube/ })).not.toBeInTheDocument();
  expect(screen.queryByText('Course introduction · Sample video')).not.toBeInTheDocument();
  expect(hero.querySelector('.shared-page-hero')).toBeNull();
  expect(hero.querySelectorAll('img')).toHaveLength(0);
});

test('offers the workspace when full lesson access is already unlocked', () => {
  show({ premiumUnlocked: true });
  expect(screen.getAllByRole('link', { name: /Continue Lesson/ })[0]).toHaveAttribute('href', '/courses/ol-ict/lessons/information/learn');
  expect(screen.queryByRole('link', { name: /Buy Full Lesson/ })).not.toBeInTheDocument();
});

test('takes an enrolled student directly to learning and purchase', () => {
  show({}, { isAuthenticated: true, isEnrolled: true });
  expect(screen.getAllByRole('link', { name: /Continue Free Lesson/ })[0]).toHaveAttribute('href', '/courses/ol-ict/lessons/information/learn');
  expect(screen.getAllByRole('link', { name: /Buy Full Lesson/ })[0]).toHaveAttribute('href', '/courses/ol-ict/lessons/information/exam-success-pack');
});

test('offers free enrollment to an authenticated student who has not enrolled', () => {
  show({}, { isAuthenticated: true });
  expect(screen.getAllByRole('link', { name: /Start Free Lesson/ })[0]).toHaveAttribute('href', '/enroll/ol-ict?returnTo=' + encodeURIComponent('/courses/ol-ict/lessons/information/learn'));
});

test.each([{ availabilityStatus: 'coming_soon' }, { isPublished: false }, { status: 'draft' }])('hides learning and purchase CTAs for unavailable lessons: %j', (state) => {
  show(state);
  expect(screen.queryByRole('link', { name: /Buy Full Lesson/ })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /Start Learning Free Now/ })).not.toBeInTheDocument();
  expect(screen.getAllByText('This lesson is coming soon.').length).toBeGreaterThan(0);
});

test('shows Sinhala headings, prices, and actions for the Sinhala learning path', () => {
  render(<MemoryRouter><LessonLanding course={{ title: 'උසස් පෙළ', medium: { code: 'sinhala' }, courseGroup: 'AL' }} lesson={{ ...lesson, title: 'තොරතුරු තාක්ෂණ සංකල්ප', landingPageContent: null }} courseSlug="al-ict-sinhala" lessonSlug="concept-of-ict" /></MemoryRouter>);
  expect(document.querySelector('.lesson-sales-page')).toHaveAttribute('lang', 'si');
  expect(screen.getAllByRole('link', { name: 'දැන් නොමිලේ ඉගෙනීම අරඹන්න' })).toHaveLength(5);
  expect(screen.getAllByRole('link', { name: 'සම්පූර්ණ පාඩම මිලදී ගන්න' })).toHaveLength(5);
  expect(screen.getByRole('heading', { name: 'මුද්‍රිත නිබන්ධනයත් සමඟ' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'ඉගෙනුම් පද්ධතියෙන් ඔබට ලැබෙන දේ' })).toBeInTheDocument();
  expect(screen.getByText('ඔබේ නිවසටම ගෙන්වා ගන්න.')).toBeInTheDocument();
  expect(screen.queryByText('Buy Full Lesson')).not.toBeInTheDocument();
  expect(screen.queryByText(/LKR/)).not.toBeInTheDocument();
  expect(screen.getByText(/රු\./)).toBeInTheDocument();
});
