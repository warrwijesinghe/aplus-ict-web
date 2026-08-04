export const SITE_NAME = 'A Plus ICT';
export const DEFAULT_OG_IMAGE = '/images/platform-learning-journey.webp';

export const PUBLIC_ROUTE_SEO = {
  '/': { title: 'Online ICT Classes for Grades 6–13', description: 'Study School, O/L and A/L ICT online with structured video lessons, learning materials and progress tracking. Learn anytime, anywhere with A Plus ICT.' },
  '/school-ict': { title: 'Online ICT Courses for Grades 6–9', description: 'Learn Grade 6, 7, 8 and 9 ICT online through syllabus-aligned lessons and learning resources. Study at your own pace with A Plus ICT.' },
  '/ol-ict': { title: 'Online O/L ICT Classes in Sri Lanka', description: 'Learn Grade 10 and Grade 11 ICT online in Sinhala or English Medium with structured lessons, materials and examination-focused support.' },
  '/al-ict': { title: 'Online A/L ICT Classes in Sri Lanka', description: 'Learn all 13 G.C.E. A/L ICT competencies online with structured video lessons, notes, activities and progress tracking.' },
  '/resources': { title: 'Free School ICT Resources and Notes', description: 'Access free ICT notes, lesson materials and revision resources for Sri Lankan students from Grade 6 to Grade 13.' },
  '/student-guide': { title: 'Student Guide', description: 'Learn how to choose a course, sign in, access available content and save your learning progress with A Plus ICT.' },
  '/about': { title: 'About A Plus ICT | Flexible Online School ICT Learning', description: 'Learn how A Plus ICT provides structured and flexible online ICT education for Sri Lankan school students in Grades 6–13.' },
  '/contact': { title: 'Contact A Plus ICT', description: 'Contact A Plus ICT with questions about school ICT learning, courses and resources.' },
  '/privacy-policy': { title: 'Privacy Policy', description: 'Privacy Policy for A Plus ICT students and visitors.', noIndex: true },
  '/terms': { title: 'Terms and Conditions', description: 'Terms and Conditions for A Plus ICT students and visitors.', noIndex: true },
  '/refund-policy': { title: 'Refund Policy', description: 'Refund Policy for A Plus ICT customers.', noIndex: true },
  '/cancellation-policy': { title: 'Cancellation Policy', description: 'Cancellation Policy for A Plus ICT customers.', noIndex: true },
  '/payment-policy': { title: 'Payment Policy', description: 'Payment Policy for A Plus ICT customers.', noIndex: true }
};

export const PUBLIC_SITEMAP_PATHS = ['/', '/school-ict', '/ol-ict', '/al-ict', '/resources', '/student-guide', '/about', '/contact'];
export const normalizePath = (path = '/') => { const pathname = path.startsWith('/') ? path : `/${path}`; return pathname === '/' ? '/' : pathname.replace(/\/+$/, ''); };
export const absoluteUrl = (path, siteUrl) => new URL(normalizePath(path), `${siteUrl.replace(/\/$/, '')}/`).toString();
export const pageTitle = (title) => `${title} | ${SITE_NAME}`;
export const getPublicSeo = (path) => PUBLIC_ROUTE_SEO[normalizePath(path)] || null;
export const courseSeo = (course) => {
  const title = course?.medium?.code === 'sinhala' ? course.titleSi || course.title : course?.titleEn || course?.title;
  const medium = course?.medium?.nameEn || course?.medium?.name || 'ICT';
  return { title: `${title || 'ICT Course'} – ${medium}`, description: course?.shortDescription || course?.shortDescriptionEn || course?.description || `Explore the ${medium} course and its available learning content.` };
};
export const lessonSeo = (lesson, course) => ({ title: `${lesson?.title || 'Lesson'} – ${course?.medium?.code === 'sinhala' ? course.titleSi || course.title : course?.titleEn || course?.title || 'ICT Course'}`, description: lesson?.shortDescription || lesson?.description || `Study ${lesson?.title || 'this lesson'} in the A Plus ICT course.` });
