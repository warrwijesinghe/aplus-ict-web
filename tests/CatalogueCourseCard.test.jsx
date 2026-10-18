import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, test } from 'vitest';
import { CatalogueCourseCard } from '../src/components/catalogue/CatalogueUi.jsx';

const renderCard = (course) => render(<MemoryRouter><CatalogueCourseCard area="OL" course={course} /></MemoryRouter>);

test('makes the whole active course card a single link with its medium and title', () => {
  renderCard({ medium: { code: 'sinhala', nameSi: 'සිංහල මාධ්‍ය' }, slug: 'grade-10-si', titleSi: '10 ශ්‍රේණිය ICT' });
  const card = screen.getByRole('heading', { name: '10 ශ්‍රේණිය ICT' }).closest('article');
  const link = within(card).getByRole('link');
  expect(link).toHaveAttribute('href', '/courses/grade-10-si');
  expect(within(link).getByText('සිංහල මාධ්‍ය')).toBeInTheDocument();
  expect(within(link).getByRole('heading', { name: '10 ශ්‍රේණිය ICT' })).toBeInTheDocument();
  expect(within(card).queryByRole('button')).not.toBeInTheDocument();
  expect(within(card).queryByText('View Course')).not.toBeInTheDocument();
});

test('shows a coming-soon course in the same card without a link', () => {
  renderCard({ medium: 'English', slug: 'future', title: 'Future course', availabilityStatus: 'inactive' });
  const card = screen.getByRole('heading', { name: 'Future course' }).closest('article');
  expect(within(card).getByText('English medium')).toBeInTheDocument();
  expect(within(card).getByText('Coming soon')).toBeInTheDocument();
  expect(within(card).queryByRole('link')).not.toBeInTheDocument();
});

test('supports optional course details through props without inventing features', () => {
  render(<MemoryRouter><CatalogueCourseCard title="BCS Professional Graduate Diploma" subtitle="Advanced study" image="/bcs.jpg" badge="Professional" category="Professional ICT" href="/courses/bcs" features={[{ type: 'video', label: 'Video lessons' }, { type: 'quiz', label: 'Quizzes' }]} /></MemoryRouter>);
  const card = screen.getByRole('heading', { name: 'BCS Professional Graduate Diploma' }).closest('article');
  expect(within(card).getByRole('link')).toHaveAttribute('href', '/courses/bcs');
  expect(within(card).getByRole('img', { name: 'BCS Professional Graduate Diploma course image' })).toHaveAttribute('src', '/bcs.jpg');
  expect(within(card).getByText('Professional ICT')).toBeInTheDocument();
  expect(within(card).getByText('Advanced study')).toBeInTheDocument();
  expect(within(card).getByRole('list', { name: 'Course features' })).toHaveTextContent('Video lessons');
  expect(within(card).queryByText('Tutorials')).not.toBeInTheDocument();
});

test('renders a minimal course without optional fields', () => {
  render(<MemoryRouter><CatalogueCourseCard title="ICT Revision" href="/courses/revision" /></MemoryRouter>);
  const card = screen.getByRole('heading', { name: 'ICT Revision' }).closest('article');
  expect(within(card).getByRole('link')).toHaveAttribute('href', '/courses/revision');
  expect(within(card).queryByRole('list')).not.toBeInTheDocument();
  expect(card.querySelector('.catalogue-course-badge')).not.toBeInTheDocument();
});
