import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { contentApi } from '../api/content.api.js';
import { queryKeys } from '../api/query-keys.js';
import { CatalogueCourseCard } from '../components/catalogue/CatalogueUi.jsx';
import { EmptyState, InlineError, LoadingSkeleton } from '../components/common/States.jsx';
import { usePageSeo } from '../seo/use-page-seo.js';

const areas = {
  SCHOOL: { path: '/school-ict', category: 'School ICT — Grades 6–9', grades: 'Grades 6–9', heading: 'Build practical ICT skills from Grade 6 to Grade 9', description: 'Choose the Government School grade and medium that fits your child’s current learning journey.', image: '/images/study-cta.jpg', journey: ['Choose the current grade', 'Choose Sinhala or English Medium', 'Learn through lessons and activities'] },
  OL: { path: '/ol-ict', category: 'O/L ICT — Grades 10 & 11', grades: 'Grades 10–11', heading: 'Build ICT confidence from Grade 10 to Grade 11', description: 'A connected Government School ICT journey from Grade 10 foundations to Grade 11 application and examination readiness.', image: '/images/ict-practice.jpg', journey: ['Build Grade 10 foundations', 'Apply skills in Grade 11', 'Prepare for O/L ICT'] },
  AL: { path: '/al-ict', category: 'A/L ICT — Grades 12 & 13', grades: 'Grades 12–13', heading: 'Master ICT from Grade 12 to Grade 13', description: 'Follow one structured, examination-focused Government School ICT syllabus across the complete A/L learning journey.', image: '/images/learning-hero.jpg', journey: ['Connect Grade 12 to Grade 13', 'Study the syllabus in sequence', 'Practise and track progress'] }
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
  return <Link className="platform-pathway" to={info.path}>
    <img alt="" height="280" loading="lazy" src={info.image} width="480" />
    <h3>{info.grades}</h3><p className="eyebrow">{info.category}</p><p>{info.description}</p>
    <span className="pathway-card-footer">Explore {info.grades} <b aria-hidden="true">→</b></span>
  </Link>;
};

export const PlatformHomePage = () => {
  const siteUrl = (import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, '');
  usePageSeo({ title: 'Government School ICT from Grade 6 to Grade 13', description: 'Structured Sri Lankan Government School ICT learning from Grade 6 to Grade 13 in Sinhala and English Medium.', path: '/', imageAlt: 'Students learning Government School ICT with A Plus ICT', structuredData: { '@context': 'https://schema.org', '@graph': [{ '@type': 'EducationalOrganization', name: 'A Plus ICT', url: siteUrl }, { '@type': 'WebSite', name: 'A Plus ICT', url: siteUrl }] } });
  return <>
    <section className="hero platform-hero"><img alt="Sri Lankan students collaborating in an ICT lesson" className="hero-image" fetchPriority="high" height="900" src="/images/platform-learning-journey.webp" width="1600" /><div className="hero-copy"><p className="eyebrow">Sri Lankan Government School ICT <span aria-hidden="true">·</span> <span lang="si">ICT ඉගෙනුම් වේදිකාව</span></p><h1>Government School ICT learning from Grade 6 to Grade 13</h1><p>Choose your grade and medium, then learn through structured videos, notes, activities, quizzes and progress tracking.</p><ul aria-label="A Plus ICT learning highlights" className="hero-highlights"><li>Grades 6–13</li><li>Sinhala &amp; English Medium</li><li>Free &amp; unlocked lessons</li></ul><p className="hero-actions"><a className="button" href="#pathways">Choose Your Grade</a><a className="button secondary" href="#how-it-works">Learn How It Works</a></p></div></section>
    <section className="home-section" id="pathways"><p className="eyebrow">Choose your grade range</p><h2>What Government School grade are you studying?</h2><p className="section-intro">Every stage is part of one continuous ICT learning journey.</p><div className="platform-pathway-grid">{['SCHOOL', 'OL', 'AL'].map((area) => <PathwayCard area={area} key={area} />)}</div></section>
    <section className="home-section"><p className="eyebrow">Why A Plus ICT</p><h2>Support for every Government School ICT step</h2><div className="benefits-grid">{[['Sinhala and English Medium', 'Choose the medium that best supports your learning.'], ['Grade-aligned learning', 'Stay focused on the ICT ideas relevant to your school grade.'], ['One lesson journey', 'Free and unlocked content sit together in the same ordered path.'], ['Progress tracking', 'Secure Google sign-in keeps your learning connected.']].map(([title, copy]) => <article key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
    <section className="home-section" id="how-it-works"><p className="eyebrow">How learning works</p><h2>Simple from the first choice to progress</h2><ol className="learning-timeline">{['Choose your grade', 'Choose Sinhala or English Medium', 'Sign in securely with Google', 'Learn and track your progress'].map((step, index) => <li key={step}><span>{index + 1}</span>{step}</li>)}</ol></section>
    <section className="home-section tutor-preview"><div className="tutor-image-frame"><img alt="WARR Wijesinghe, ICT Educator and Software Engineer" className="tutor-image" height="720" loading="lazy" src="/images/aplus-ict-tutor.png" width="720" /></div><div><p className="eyebrow">Your tutor</p><h2>WARR Wijesinghe</h2><p>ICT Educator · Software Engineer</p><p>Clear foundations, practical thinking and consistent study habits help students move confidently from one grade to the next.</p><Link className="text-link" to="/about">Meet the tutor →</Link></div></section>
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
  usePageSeo({ title: `${info.grades} Government School ICT`, description: `${info.description} Choose Sinhala or English Medium with A Plus ICT.`, path: info.path, image: info.image });
  return <><section className="area-hero"><img alt="" height="600" src={info.image} width="1200" /><div><p className="eyebrow">{info.category}</p><h1>{info.heading}</h1><p>{info.description}</p></div></section><section className="home-section"><p className="eyebrow">Learning journey</p><div className="learning-timeline">{info.journey.map((item, index) => <div key={item}><span>{index + 1}</span>{item}</div>)}</div></section><section className="home-section"><p className="eyebrow">Choose your next step</p><h2>{area === 'AL' ? 'Choose your A/L ICT medium' : 'Choose your grade, then your medium'}</h2><div className="filter-bar" aria-label="Grade and medium selection">{area !== 'AL' ? <div>{grades.map((grade) => <button aria-pressed={selectedGrade === grade} className={selectedGrade === grade ? 'selected' : ''} key={grade} onClick={() => setFilter('grade', selectedGrade === grade ? '' : grade)} type="button">Grade {grade}</button>)}</div> : <p>One connected course supports Grade 12 and Grade 13.</p>}<div>{[['si', 'සිංහල මාධ්‍යය'], ['en', 'English Medium']].map(([code, label]) => <button aria-pressed={selectedMedium === code} className={selectedMedium === code ? 'selected' : ''} key={code} onClick={() => setFilter('medium', selectedMedium === code ? '' : code)} type="button">{label}</button>)}</div>{hasSelection ? <button className="text-link" onClick={() => setParams({})} type="button">Clear selection</button> : null}</div>{catalogue.isPending ? <LoadingSkeleton label={`Loading ${info.grades} courses`} /> : null}{catalogue.isError ? <InlineError error={catalogue.error} onRetry={catalogue.refetch} /> : null}{catalogue.isSuccess && !filtered.length ? <EmptyState title="Content for this selection is being prepared"><p>Choose another grade or medium to continue in this pathway.</p></EmptyState> : null}{filtered.length ? <div className="catalogue-course-grid">{filtered.map((course) => <CatalogueCourseCard course={course} key={course.id} />)}</div> : null}</section><section className="home-section"><p className="eyebrow">Learning access</p><h2>{area === 'SCHOOL' ? 'What your child will learn' : 'Free and unlocked learning in one path'}</h2><p>{area === 'SCHOOL' ? 'Safe and confident computer use, practical digital skills, grade-aligned ICT concepts, activities and visible progress.' : 'Available free chapters and unlocked content remain in the same lesson sequence, so learning can continue in order.'}</p>{area === 'OL' ? <div className="faq-list"><details><summary>How does the Grade 10 to Grade 11 journey connect?</summary><p>Choose the current grade to focus on its relevant ICT learning, then continue into the next stage when ready.</p></details></div> : null}</section></>;
};
export const AlIctPage = () => <AcademicAreaPage area="AL" />;
export const OlIctPage = () => <AcademicAreaPage area="OL" />;
export const SchoolIctPage = () => <AcademicAreaPage area="SCHOOL" />;
