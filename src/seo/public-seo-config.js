export const SITE_NAME = 'A Plus ICT';
export const DEFAULT_OG_IMAGE = '/images/platform-learning-journey.webp';

export const PUBLIC_ROUTE_SEO = {
  '/': {
    title: 'School ICT Courses in Sri Lanka — Grades 6–13',
    description: 'Learn Sri Lankan school ICT from Grade 6 to A/L in Sinhala and English Medium with structured video lessons, notes, activities, quizzes and progress tracking.'
  },
  '/school-ict': {
    title: 'Grade 6–9 ICT Courses in Sinhala & English',
    description: 'Build practical school ICT skills from Grade 6 to Grade 9 through structured Sinhala and English Medium lessons and activities.'
  },
  '/ol-ict': {
    title: 'O/L ICT Courses for Grades 10–11',
    description: 'Learn Grade 10 and Grade 11 ICT through connected Sinhala and English Medium courses designed for practical skills and examination preparation.'
  },
  '/al-ict': {
    title: 'A/L ICT Sinhala & English Medium Courses',
    description: 'Learn the complete Sri Lankan A/L ICT syllabus through structured Sinhala Medium and English Medium courses, lessons, notes, activities and quizzes.'
  },
  '/resources': {
    title: 'Free ICT Learning Resources for Sri Lankan Students',
    description: 'Browse published ICT learning resources for Sri Lankan students in Sinhala and English Medium.'
  },
  '/student-guide': {
    title: 'Student Guide',
    description: 'Learn how to choose a course, sign in, access available content and save your learning progress with A Plus ICT.'
  },
  '/about': {
    title: 'About WARR Wijesinghe and A Plus ICT',
    description: 'Learn about WARR Wijesinghe and the structured school ICT learning approach behind A Plus ICT.'
  },
  '/contact': {
    title: 'Contact A Plus ICT',
    description: 'Contact A Plus ICT with questions about school ICT learning, courses and resources.'
  },
  '/privacy-policy': { title: 'Privacy Policy', description: 'Privacy Policy for A Plus ICT students and visitors.', noIndex: true },
  '/terms': { title: 'Terms of Use', description: 'Terms of Use for A Plus ICT students and visitors.', noIndex: true }
};

export const PUBLIC_SITEMAP_PATHS = [
  '/', '/school-ict', '/ol-ict', '/al-ict', '/resources', '/student-guide', '/about', '/contact'
];

export const normalizePath = (path = '/') => {
  const pathname = path.startsWith('/') ? path : `/${path}`;
  return pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
};

export const absoluteUrl = (path, siteUrl) => new URL(normalizePath(path), `${siteUrl.replace(/\/$/, '')}/`).toString();

export const pageTitle = (title) => `${title} | ${SITE_NAME}`;

export const getPublicSeo = (path) => PUBLIC_ROUTE_SEO[normalizePath(path)] || null;

export const courseSeo = (course) => {
  const title = course?.medium?.code === 'sinhala'
    ? course.titleSi || course.title
    : course?.titleEn || course?.title;
  const medium = course?.medium?.nameEn || course?.medium?.name || 'ICT';
  return {
    title: `${title || 'ICT Course'} – ${medium}`,
    description: course?.shortDescription || course?.shortDescriptionEn || course?.description || `Explore the ${medium} course and its available learning content.`
  };
};

export const lessonSeo = (lesson, course) => ({
  title: `${lesson?.title || 'Lesson'} – ${course?.medium?.code === 'sinhala' ? course.titleSi || course.title : course?.titleEn || course?.title || 'ICT Course'}`,
  description: lesson?.shortDescription || lesson?.description || `Study ${lesson?.title || 'this lesson'} in the A Plus ICT course.`
});
