import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { contentApi } from '../api/content.api.js';
import { queryKeys } from '../api/query-keys.js';
import { resourceApi } from '../api/resource.api.js';
import { trackPublicEvent } from '../analytics/events.js';
import { useAuth } from '../auth/auth-context.jsx';
import { destinationForUser } from '../utils/route-destination.js';
import { CatalogueCourseCard } from '../components/catalogue/CatalogueUi.jsx';
import { EmptyState, InlineError, LoadingSkeleton } from '../components/common/States.jsx';
import { usePageSeo } from '../seo/use-page-seo.js';

const areas = {
  SCHOOL: {
    path: '/school-ict', label: 'School ICT · Grades 6–9', grades: 'Grades 6–9',
    cardTitle: 'Build Strong ICT Foundations',
    heading: 'Build Strong ICT Foundations from Grade 6 to Grade 9',
    description: 'Choose the student’s current grade and medium, then follow a clear sequence of lessons and practical activities.',
    cardDescription: 'Learn safe computer use, practical digital skills and grade-aligned ICT concepts step by step.',
    cta: 'Explore Grades 6–9', image: '/images/study-cta.jpg', journey: ['Choose the current grade', 'Choose Sinhala or English Medium', 'Learn through lessons and practical activities']
  },
  OL: {
    path: '/ol-ict', label: 'O/L ICT · Grades 10–11', grades: 'Grades 10–11',
    cardTitle: 'Prepare Confidently for O/L ICT',
    heading: 'Prepare for O/L ICT with a Connected Grade 10–11 Learning Path',
    description: 'Build the Grade 10 foundation, apply it in Grade 11 and prepare confidently for school assessments and the O/L examination.',
    cardDescription: 'Connect theory, practical activities and examination-focused learning across Grades 10 and 11.',
    cta: 'Explore O/L ICT', image: '/images/ict-practice.jpg', journey: ['Build Grade 10 foundations', 'Apply skills in Grade 11', 'Prepare for O/L ICT']
  },
  AL: {
    path: '/al-ict', label: 'A/L ICT · Grades 12–13', grades: 'Grades 12–13',
    cardTitle: 'Master the Complete A/L ICT Syllabus', heading: 'Master A/L ICT Step by Step',
    description: 'Follow the complete Grade 12–13 ICT syllabus in Sinhala Medium or English Medium through one structured course.',
    cardDescription: 'Learn all 13 syllabus areas through an ordered Sinhala or English Medium course.',
    cta: 'Explore A/L ICT', image: '/images/learning-hero.jpg', journey: ['Connect Grade 12 to Grade 13', 'Study the syllabus in sequence', 'Practise and track progress']
  }
};

const areaForCourse = (course) => {
  if (course.courseGroup) return course.courseGroup;
  const level = String(course.academicLevel?.code || course.academicLevel || '').toUpperCase();
  if (level === 'AL' || course.slug?.startsWith('al-')) return 'AL';
  if (level === 'OL' || course.slug?.startsWith('ol-')) return 'OL';
  return /GRADE_?[6-9]/.test(level) || course.slug?.startsWith('grade-') ? 'SCHOOL' : null;
};
const courseGrade = (course) => String(course.grade || course.academicLevel?.code || '').match(/(?:GRADE_?)?(6|7|8|9|10|11|12|13)/)?.[1];
const mediumCode = (course) => course.medium?.code === 'sinhala' ? 'si' : course.medium?.code === 'english' ? 'en' : course.medium?.code;

const PathwayCard = ({ area }) => {
  const info = areas[area];
  return <Link className="platform-pathway" onClick={() => trackPublicEvent('homepage_pathway_selected', { pathway: area.toLowerCase() })} to={info.path}>
    <img alt="" height="280" loading="lazy" src={info.image} width="480" />
    <p className="eyebrow">{info.label}</p><h3>{info.cardTitle}</h3><p>{info.cardDescription}</p>
    <span className="pathway-card-footer">{info.cta} <b aria-hidden="true">→</b></span>
  </Link>;
};

const AvailableCourses = () => {
  const catalogue = useQuery({ queryKey: queryKeys.content.publicCourses(), queryFn: ({ signal }) => contentApi.publicCourses({}, signal), staleTime: 60_000, retry: 1 });
  const courses = (catalogue.data?.data || []).filter((course) => course.availabilityStatus !== 'coming_soon');
  if (!courses.length) return null;
  return <section className="home-section" aria-labelledby="available-courses-heading">
    <p className="eyebrow">Currently available courses</p><h2 id="available-courses-heading">Choose your course and medium</h2>
    <div className="catalogue-course-grid">{courses.map((course) => <CatalogueCourseCard course={course} key={course.id} />)}</div>
  </section>;
};

const ResourcePreview = () => {
  const resources = useQuery({ queryKey: queryKeys.content.publicDownloads({ accessPolicy: 'free' }), queryFn: ({ signal }) => resourceApi.publicDownloads({ accessPolicy: 'free' }, signal), staleTime: 60_000, retry: 1 });
  const items = resources.data?.data?.items || [];
  if (!items.length) return null;
  return <section className="home-section" aria-labelledby="resources-preview-heading">
    <p className="eyebrow">Free resources</p><h2 id="resources-preview-heading">Published resources for your learning</h2>
    <ul className="resource-preview-list">{items.slice(0, 3).map((item) => <li key={item.id}><Link onClick={() => trackPublicEvent('resource_opened', { resource_type: item.resourceType })} to="/resources">{item.title}</Link></li>)}</ul>
    <Link className="text-link" to="/resources">Browse free ICT resources →</Link>
  </section>;
};

export const PlatformHomePage = () => {
  const { isAuthenticated, user } = useAuth();
  usePageSeo({ path: '/', structuredData: { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebSite', name: 'A Plus ICT', url: new URL('/', import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin).toString() },
    { '@type': 'EducationalOrganization', name: 'A Plus ICT', alternateName: 'A Plus ICT Learning', url: new URL('/', import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin).toString() }
  ] } });
  return <>
    <section className="platform-hero-split">
      <div className="hero-copy"><p className="eyebrow">Sri Lanka School ICT · Grades 6–13</p><p className="hero-sinhala" lang="si">6 ශ්‍රේණියේ සිට උසස් පෙළ දක්වා</p>
        <h1>Learn ICT Clearly — From Grade 6 to A/L</h1><p className="hero-sinhala" lang="si">6 ශ්‍රේණියේ සිට උසස් පෙළ දක්වා ICT විෂය නිර්දේශය පැහැදිලිව හා ක්‍රමානුකූලව ඉගෙන ගන්න.</p>
        <p>Choose your grade and medium. Learn with structured video lessons, notes, activities, quizzes and progress tracking.</p>
        <p className="hero-actions"><a className="button" href="#pathways">Choose Your Grade</a></p>
        <Link className="hero-text-link" to={isAuthenticated ? destinationForUser(user) : '/login'}>{isAuthenticated && user?.roles?.some((role) => (typeof role === 'string' ? role : role.code) === 'student') ? 'Open My Learning' : 'Student Login'}</Link>
      </div>
      <img alt="Sri Lankan students collaborating in an ICT lesson" className="platform-hero-image" fetchPriority="high" height="900" src="/images/platform-learning-journey.webp" width="1600" />
    </section>
    <section className="home-section" id="pathways"><p className="eyebrow">Choose your pathway</p><h2>School ICT learning for every stage</h2><p className="section-intro">Choose the learning path that matches the student’s current grade range.</p><div className="platform-pathway-grid">{Object.keys(areas).map((area) => <PathwayCard area={area} key={area} />)}</div></section>
    <AvailableCourses />
    <section className="home-section"><p className="eyebrow">Why A Plus ICT</p><h2>A clear path for school ICT learning</h2><div className="benefits-grid">{[
      ['Syllabus-aligned learning', 'Follow the Sri Lankan school ICT syllabus in the correct sequence.'],
      ['Sinhala and English Medium', 'Choose the medium that best supports your learning.'],
      ['Free and purchased content together', 'Continue through one ordered lesson path without moving between separate course experiences.'],
      ['Visible learning progress', 'Sign in securely and continue from where you stopped.']
    ].map(([title, copy]) => <article key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
    <section className="home-section" id="how-it-works"><p className="eyebrow">How learning works</p><h2>Start Learning in Four Simple Steps</h2><ol className="learning-timeline">{['Choose your grade.', 'Choose Sinhala or English Medium.', 'Preview the course and available free content.', 'Sign in to learn and save your progress.'].map((step, index) => <li key={step}><span>{index + 1}</span>{step}</li>)}</ol></section>
    <section className="home-section tutor-preview"><div className="tutor-image-frame"><img alt="WARR Wijesinghe, ICT Educator and Software Engineer" className="tutor-image" height="720" loading="lazy" src="/images/aplus-ict-tutor.png" width="720" /></div><div><p className="eyebrow">Your tutor</p><h2>WARR Wijesinghe</h2><p>ICT Educator · Software Engineer</p><p>Learn ICT through clear explanations, practical thinking and a structured path designed for Sri Lankan school students.</p><Link className="text-link" to="/about">Meet the tutor →</Link></div></section>
    <ResourcePreview />
    <section className="home-section faq-section"><p className="eyebrow">FAQ</p><h2>Questions before you begin?</h2><div className="faq-list">{[
      ['Can I choose a course by grade and medium?', 'Yes. Start with the academic pathway that matches the student’s grade, then choose the available medium.'],
      ['Are Sinhala and English Medium separate?', 'Yes. Each course keeps its learning path separate so students can learn in their chosen medium.'],
      ['Can I preview free content?', 'Available free content is shown on each course before you start learning.'],
      ['How is progress saved?', 'After secure sign-in, your learning progress is saved as you complete available activities.']
    ].map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>
  </>;
};

export const AcademicAreaPage = ({ area }) => {
  const info = areas[area]; const [params, setParams] = useSearchParams();
  const catalogue = useQuery({ queryKey: queryKeys.content.publicCourses(), queryFn: ({ signal }) => contentApi.publicCourses({}, signal), staleTime: 60_000, retry: 1 });
  const selectedGrade = params.get('grade') || ''; const selectedMedium = params.get('medium') || '';
  const grades = area === 'AL' ? ['12', '13'] : area === 'OL' ? ['10', '11'] : ['6', '7', '8', '9'];
  const courses = (catalogue.data?.data || []).filter((course) => areaForCourse(course) === area);
  const filtered = courses.filter((course) => (!selectedGrade || area === 'AL' || courseGrade(course) === selectedGrade) && (!selectedMedium || mediumCode(course) === selectedMedium));
  const setFilter = (key, value) => { const next = new URLSearchParams(params); value ? next.set(key, value) : next.delete(key); setParams(next); };
  const hasSelection = selectedGrade || selectedMedium;
  usePageSeo({ path: info.path, image: info.image, structuredData: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: info.heading } });
  return <><section className="area-hero"><img alt="Students learning ICT" height="600" loading="eager" src={info.image} width="1200" /><div><p className="eyebrow">{info.label}</p><h1>{info.heading}</h1><p>{info.description}</p></div></section><section className="home-section"><p className="eyebrow">Learning journey</p><div className="learning-timeline">{info.journey.map((item, index) => <div key={item}><span>{index + 1}</span>{item}</div>)}</div></section><section className="home-section"><p className="eyebrow">Choose your next step</p><h2>{area === 'AL' ? 'Choose your A/L ICT medium' : 'Choose your grade, then your medium'}</h2><div className="filter-bar" aria-label="Grade and medium selection">{area !== 'AL' ? <div>{grades.map((grade) => <button aria-pressed={selectedGrade === grade} className={selectedGrade === grade ? 'selected' : ''} key={grade} onClick={() => setFilter('grade', selectedGrade === grade ? '' : grade)} type="button">Grade {grade}</button>)}</div> : <p>One connected course supports Grade 12 and Grade 13.</p>}<div>{[['si', 'සිංහල මාධ්‍යය'], ['en', 'English Medium']].map(([code, label]) => <button aria-pressed={selectedMedium === code} className={selectedMedium === code ? 'selected' : ''} key={code} onClick={() => setFilter('medium', selectedMedium === code ? '' : code)} type="button">{label}</button>)}</div>{hasSelection ? <button className="text-link" onClick={() => setParams({})} type="button">Clear selection</button> : null}</div>{catalogue.isPending ? <LoadingSkeleton label={`Loading ${info.grades} courses`} /> : null}{catalogue.isError ? <InlineError error={catalogue.error} onRetry={catalogue.refetch} /> : null}{catalogue.isSuccess && !filtered.length ? <EmptyState title={hasSelection ? 'Content for this selection is being prepared' : 'Courses for this pathway are coming soon'}><p>{hasSelection ? 'Choose another grade or medium to continue in this pathway.' : 'Please check again when published courses become available.'}</p></EmptyState> : null}{filtered.length ? <div className="catalogue-course-grid">{filtered.map((course) => <CatalogueCourseCard course={course} key={course.id} />)}</div> : null}</section></>;
};
export const AlIctPage = () => <AcademicAreaPage area="AL" />;
export const OlIctPage = () => <AcademicAreaPage area="OL" />;
export const SchoolIctPage = () => <AcademicAreaPage area="SCHOOL" />;
