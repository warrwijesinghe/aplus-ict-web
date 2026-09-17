import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, test } from 'vitest';
import { CatalogueCourseCard } from '../src/components/catalogue/CatalogueUi.jsx';

const renderCard = (course) => render(
  <MemoryRouter><CatalogueCourseCard area="OL" course={course} /></MemoryRouter>
);

test('renders a simple clickable Sinhala course card', () => {
  renderCard({
    academicLevel: { code: 'GRADE_10' },
    availabilityStatus: 'active',
    id: 'grade-10-si',
    medium: { code: 'sinhala', nameSi: 'සිංහල මාධ්‍ය' },
    shortDescriptionSi: 'ඉදිරියේදී ලබා ගත හැකි පාඩම් මාර්ගයකි.',
    slug: 'grade-10-ict-si',
    titleSi: '10 ශ්‍රේණිය ICT'
  });

  const card = screen.getByRole('heading', { level: 3, name: '10 ශ්‍රේණිය ICT' }).closest('article');
  expect(within(card).getByText('සිංහල මාධ්‍ය')).toBeInTheDocument();
  expect(within(card).getByRole('img', { name: '10 ශ්‍රේණිය ICT course cover' })).toBeInTheDocument();
  expect(within(card).getByRole('link', { name: 'Open 10 ශ්‍රේණිය ICT' })).toHaveAttribute('href', '/courses/grade-10-ict-si');
  expect(within(card).getByText('Grade 10')).toBeInTheDocument();
  expect(within(card).queryByText(/O\/L ICT දැනුම/)).not.toBeInTheDocument();
  expect(within(card).queryByRole('list')).not.toBeInTheDocument();
});

test('uses English text and the existing route for an English-medium course', () => {
  renderCard({
    academicLevel: { code: 'GRADE_10' },
    id: 'grade-10-en',
    medium: { code: 'english', nameEn: 'English Medium' },
    shortDescriptionEn: 'Build strong O/L ICT knowledge through structured lessons, practical activities, and exam-focused revision.',
    slug: 'grade-10-ict-en',
    titleEn: 'Grade 10 ICT'
  });

  const card = screen.getByRole('heading', { level: 3, name: 'Grade 10 ICT' }).closest('article');
  expect(within(card).getByText('English Medium')).toBeInTheDocument();
  expect(within(card).getByRole('img', { name: 'Grade 10 ICT course cover' })).toBeInTheDocument();
  expect(within(card).getByRole('link', { name: 'Open Grade 10 ICT' })).toHaveAttribute('href', '/courses/grade-10-ict-en');
  expect(within(card).queryByText('Complete lesson list')).not.toBeInTheDocument();
});
