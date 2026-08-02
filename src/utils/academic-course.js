const mediumAliases = {
  si: 'si', sinhala: 'si', sinhala_medium: 'si',
  en: 'en', english: 'en', english_medium: 'en'
};

export const normalizeMedium = (value) => mediumAliases[String(value || '').trim().toLowerCase()] || '';

export const mediumForCourse = (course = {}) => normalizeMedium(
  course.medium?.code || course.medium?.name || course.medium
);

export const gradeForCourse = (course = {}) => {
  const source = [course.grade, course.academicLevel?.code, course.academicLevel, course.title, course.slug]
    .filter(Boolean)
    .join(' ');
  return String(source).match(/(?:grade[_ -]?)?(6|7|8|9|10|11|12|13)(?!\d)/i)?.[1] || '';
};

export const academicAreaForCourse = (course = {}) => {
  const level = String(course.courseGroup || course.academicLevel?.code || course.academicLevel || '').toUpperCase();
  const grade = gradeForCourse(course);
  const slug = String(course.slug || '').toLowerCase();
  if (level === 'AL' || slug.startsWith('al-') || ['12', '13'].includes(grade)) return 'AL';
  if (level === 'OL' || slug.startsWith('ol-') || ['10', '11'].includes(grade)) return 'OL';
  if (level === 'SCHOOL' || slug.startsWith('grade-') || ['6', '7', '8', '9'].includes(grade)) return 'SCHOOL';
  return null;
};

export const academicAreaDetails = (course) => {
  const area = academicAreaForCourse(course);
  if (area === 'SCHOOL') return { area, label: 'Grades 6–9', path: '/school-ict' };
  if (area === 'OL') return { area, label: 'O/L ICT', path: '/ol-ict' };
  return { area: 'AL', label: 'A/L ICT', path: '/al-ict' };
};

export const courseBreadcrumbs = (course) => {
  const { label, path } = academicAreaDetails(course);
  const grade = gradeForCourse(course);
  const medium = mediumForCourse(course) === 'si' ? 'Sinhala Medium' : 'English Medium';
  return [{ label: 'Home', path: '/' }, { label, path }, ...(grade ? [{ label: `Grade ${grade} ICT` }] : []), { label: medium }];
};

export const isComingSoon = (item = {}) => String(item.availabilityStatus || item.status || '').toLowerCase() === 'coming_soon';
