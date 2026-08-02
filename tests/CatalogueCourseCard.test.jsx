import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, test } from 'vitest';
import { CatalogueCourseCard } from '../src/components/catalogue/CatalogueUi.jsx';

const renderCard = (course) => render(
  <MemoryRouter><CatalogueCourseCard area="OL" course={course} /></MemoryRouter>
);

test('renders the redesigned Sinhala course card without publication status UI', () => {
  renderCard({
    academicLevel: { code: 'GRADE_10' },
    availabilityStatus: 'coming_soon',
    id: 'grade-10-si',
    medium: { code: 'sinhala', nameSi: 'සිංහල මාධ්‍ය' },
    shortDescriptionSi: 'ඉදිරියේදී ලබා ගත හැකි පාඩම් මාර්ගයකි.',
    slug: 'grade-10-ict-si',
    titleSi: '10 ශ්‍රේණිය ICT'
  });

  const card = screen.getByRole('heading', { level: 3, name: '10 ශ්‍රේණිය ICT' }).closest('article');
  expect(within(card).getByText('සිංහල මාධ්‍ය')).toBeInTheDocument();
  expect(within(card).getByText('Grade 10')).toBeInTheDocument();
  expect(within(card).getByText(/O\/L ICT දැනුම/)).toBeInTheDocument();
  expect(within(card).getByRole('link', { name: 'View Course' })).toHaveAttribute('href', '/courses/grade-10-ict-si');
  expect(within(card).getAllByRole('listitem')).toHaveLength(3);
  expect(within(card).queryByText(/coming soon|published lessons|free content/i)).not.toBeInTheDocument();
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
  expect(within(card).getByText('Complete lesson list')).toBeInTheDocument();
  expect(within(card).getByRole('link', { name: 'View Course' })).toHaveAttribute('href', '/courses/grade-10-ict-en');
});
