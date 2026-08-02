import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { contentApi } from '../api/content.api.js';
import { queryKeys } from '../api/query-keys.js';
import { CatalogueCourseCard } from '../components/catalogue/CatalogueUi.jsx';
import { EmptyState, InlineError, LoadingSkeleton } from '../components/common/States.jsx';
import { academicAreaForCourse } from '../config/lesson-pricing.js';
import { gradeForCourse, mediumForCourse } from '../utils/academic-course.js';
import { usePageSeo } from '../seo/use-page-seo.js';
import { HomeHero } from '../components/home/HomeHero.jsx';
import { PlatformExperience } from '../components/home/PlatformExperience.jsx';
import { EducatorSection } from '../components/home/EducatorSection.jsx';
import { HomeFaq as RefinedHomeFaq } from '../components/home/HomeFaq.jsx';
import { HomeCourseCollections } from '../components/home/HomeCourseCollections.jsx';

const AREAS = {
  SCHOOL: {
    path: '/school-ict',
    image: '/images/learning-places/school-online-learning.webp',
    label: 'School ICT · Grades 6–9',
    title: 'Build Strong ICT Skills from Grade 6',
    description: 'Develop practical digital knowledge and a strong ICT foundation through lessons organised for each school grade.',
    support: 'ICT පදනම නිවැරදිව ගොඩනගමූ.',
    action: 'Choose Your Grade'
  },
  OL: {
    path: '/ol-ict',
    image: '/images/learning-places/ol-online-learning.webp',
    label: 'G.C.E. O/L ICT · Grades 10–11',
    title: 'Master O/L ICT One Syllabus Unit at a Time',
    description: 'Understand theory, strengthen practical knowledge, and prepare for the examination through a clear, structured online learning path.',
    support: 'පාඩමෙන් පාඩමට විශ්වාසයෙන් ඉදිරියට යමු.',
    action: 'Explore O/L ICT Courses'
  },
  AL: {
    path: '/al-ict',
    image: '/images/learning-places/al-online-learning.webp',
    label: 'G.C.E. A/L ICT · Grades 12–13',
    title: 'Learn All 13 A/L ICT Competencies at Your Own Pace',
    description: 'Follow the complete A/L ICT syllabus through clearly organised video lessons, learning materials, activities, and exam-focused guidance.',
    support: 'සංකීර්ණ ICT සංකල්ප සරලව තේරුම් ගනිමු.',
    action: 'Choose Your Medium'
  }
};

export const PlatformHomePage = () => {
  usePageSeo({ path: '/', structuredData: { '@context': 'https://schema.org', '@type': 'EducationalOrganization', name: 'A Plus ICT' } });

  return <>
    <HomeHero />
    <HomeCourseCollections />
    <PlatformExperience />
    <EducatorSection />
    <RefinedHomeFaq />
  </>;
};

const Hero = ({ area }) => {
  const info = AREAS[area];
  return <section aria-labelledby={`${area.toLowerCase()}-hero-title`} className="public-hero">
    <div className="public-hero-copy">
      <p className="eyebrow">{info.label}</p>
      <h1 id={`${area.toLowerCase()}-hero-title`}>{info.title}</h1>
      <p className="hero-language-note" lang="si">{info.support}</p>
      <p>{info.description}</p>
      <div className="hero-actions"><a className="button" href="#course-selection">{info.action}</a><Link className="button secondary" to="/free-lessons">Start Learning Free</Link></div>
    </div>
    <div className="public-hero-media"><img alt="Student learning ICT online with a laptop" height="810" loading="lazy" sizes="(min-width: 768px) 50vw, 100vw" src={info.image} width="1440" /></div>
  </section>;
};

const ValueStrip = () => <section aria-label="A Plus ICT learning benefits" className="benefit-strip">
  <div><strong>Learn Anytime. Anywhere.</strong><span>Study at your own pace</span></div>
  <div><strong>Grade 6 to A/L</strong><span>Complete School ICT pathway</span></div>
  <div><strong>Sinhala &amp; English Medium</strong><span>Learn in your preferred medium</span></div>
  <div><strong>Any Device</strong><span>Phone, tablet or computer</span></div>
</section>;

const CourseCards = ({ area, courses, loading, error, matches }) => {
  if (loading) return <LoadingSkeleton label="Loading published courses" />;
  if (error) return <InlineError error={error} />;
  const visible = courses.filter(matches);
  return visible.length ? <div className="catalogue-course-grid landing-course-grid">{visible.map((course) => <CatalogueCourseCard area={area} course={course} key={course.id} />)}</div> : <EmptyState title="Courses will appear here as they are published"><p>Choose a different grade or medium, or check back soon.</p></EmptyState>;
};


const AreaSupport = ({ area }) => {
  if (area === 'SCHOOL') return <section className="home-section grade-roadmap"><p className="eyebrow">Choose your grade</p><h2>Start with the grade you are in now</h2><div>{[['6', 'Start your ICT journey with basic computer concepts, safe technology use, and essential digital skills.'], ['7', 'Continue building practical knowledge and learn how digital systems are used in everyday life.'], ['8', 'Strengthen your understanding through structured concepts, activities, and practical applications.'], ['9', 'Prepare for upper-school ICT with stronger digital, logical, and problem-solving skills.']].map(([grade, copy]) => <Link key={grade} to={`/school-ict?grade=${grade}#course-selection`}><span>Grade {grade}</span><p>{copy}</p><b>View Grade {grade} →</b></Link>)}</div></section>;
  if (area === 'OL') return <section className="home-section checklist-section"><p className="eyebrow">Complete O/L ICT Preparation in One Place</p><h2>A clear path for Grades 10 and 11</h2><ul>{['Grade 10 and Grade 11 syllabus coverage', 'Sinhala Medium and English Medium learning paths', 'Structured video explanations', 'Notes and lesson materials', 'Practical ICT guidance', 'Revision and examination-focused content', 'Student progress tracking'].map((item) => <li key={item}>{item}</li>)}</ul></section>;
  return <section className="home-section competency-section"><p className="eyebrow">A clear path through the complete A/L ICT syllabus</p><h2>Every competency in official syllabus order</h2><p>Published competency cards show the available medium, chapters, free content, your progress after sign-in, and the next suitable action: Start, Continue, Review, or Unlock.</p></section>;
};

const AcademicLandingPage = ({ area }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const grade = searchParams.get('grade') || '';
  const medium = searchParams.get('medium') || '';
  const info = AREAS[area];
  const catalogue = useQuery({ queryKey: queryKeys.content.publicCourses(), queryFn: ({ signal }) => contentApi.publicCourses({}, signal), staleTime: 60_000, retry: 1 });
  const courses = (catalogue.data?.data || []).filter((course) => academicAreaForCourse(course) === area);
  usePageSeo({ path: info.path, image: info.image, structuredData: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: info.title } });
  const grades = area === 'SCHOOL' ? ['6', '7', '8', '9'] : area === 'OL' ? ['10', '11'] : [];
  const updateSelection = (next) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => value ? params.set(key, value) : params.delete(key));
    setSearchParams(params, { replace: true });
  };
  const resetSelection = () => setSearchParams({}, { replace: true });
  useEffect(() => {
    if (!grade && !medium) return;
    const target = document.getElementById('course-selection');
    if (!target) return;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  }, [grade, medium]);
  return <><Hero area={area} /><ValueStrip /><AreaSupport area={area} />
    <section className="home-section course-picker" id="course-selection"><p className="eyebrow">Find your course</p><h2>{area === 'SCHOOL' ? 'Choose your grade and medium' : info.action}</h2><p>Select the available learning path that suits you.</p><div className="guided-selectors">{grades.length ? <fieldset><legend>Choose grade</legend>{grades.map((value) => <button aria-pressed={grade === value} className={grade === value ? 'selected' : ''} key={value} onClick={() => updateSelection({ grade: value })} type="button">Grade {value}</button>)}</fieldset> : null}<fieldset><legend>Choose medium</legend><button aria-pressed={medium === 'si'} className={medium === 'si' ? 'selected' : ''} onClick={() => updateSelection({ medium: 'si' })} type="button" lang="si">සිංහල මාධ්‍යය</button><button aria-pressed={medium === 'en'} className={medium === 'en' ? 'selected' : ''} onClick={() => updateSelection({ medium: 'en' })} type="button">English Medium</button>{grade || medium ? <button className="filter-reset" onClick={resetSelection} type="button">Reset selection</button> : null}</fieldset></div>{grade || medium ? <p className="active-filter-feedback" aria-live="polite">Showing {grade ? `Grade ${grade}` : 'all grades'} {medium ? `· ${medium === 'si' ? 'Sinhala Medium' : 'English Medium'}` : ''} courses.</p> : null}<CourseCards area={area} courses={courses} error={catalogue.error} loading={catalogue.isPending} matches={(course) => (!grade || gradeForCourse(course) === grade) && (!medium || mediumForCourse(course) === medium)} /></section>
    <section className="final-home-cta"><div><p className="eyebrow">Learn on your own terms</p><h2>{area === 'AL' ? 'Choose your medium and start your A/L ICT path.' : 'Your next ICT lesson is ready when you are.'}</h2></div><Link className="button secondary" to="/free-lessons">Start a Free Lesson</Link></section>
  </>;
};

export const AlIctPage = () => <AcademicLandingPage area="AL" />;
export const OlIctPage = () => <AcademicLandingPage area="OL" />;
export const SchoolIctPage = () => <AcademicLandingPage area="SCHOOL" />;
