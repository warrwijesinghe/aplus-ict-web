import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { contentApi } from '../api/content.api.js';
import { queryKeys } from '../api/query-keys.js';
import { resourceApi } from '../api/resource.api.js';
import { trackPublicEvent } from '../analytics/events.js';
import { useAuth } from '../auth/auth-context.jsx';
import { CatalogueCourseCard } from '../components/catalogue/CatalogueUi.jsx';
import { LessonPrice } from '../components/pricing/LessonPrice.jsx';
import { EmptyState, InlineError, LoadingSkeleton } from '../components/common/States.jsx';
import { academicAreaForCourse } from '../config/lesson-pricing.js';
import { usePageSeo } from '../seo/use-page-seo.js';
import { destinationForUser } from '../utils/route-destination.js';

const AREAS = {
  SCHOOL: {
    path: '/school-ict', image: '/images/study-cta.jpg', label: 'School ICT · Grades 6–9',
    title: 'School ICT learning, wherever life happens.', support: 'ඕනෑම වෙලාවක, ඕනෑම තැනක ඉගෙන ගන්න',
    description: 'An online course aligned with school learning—so students can build ICT skills at their own pace, from home or anywhere.',
    action: 'Choose grade & medium', finalTitle: 'Find the right ICT course for your child.'
  },
  OL: {
    path: '/ol-ict', image: '/images/ict-practice.jpg', label: 'O/L ICT · Grades 10–11',
    title: 'Prepare for O/L ICT on your own time.', support: 'ඕනෑම වෙලාවක, ඕනෑම තැනක ඉගෙන ගන්න',
    description: 'An online Grade 10–11 learning path that lets students revisit lessons, practise, and prepare wherever they are.',
    action: 'Choose your O/L course', finalTitle: 'Choose your O/L ICT course.'
  },
  AL: {
    path: '/al-ict', image: '/images/learning-hero.jpg', label: 'A/L ICT · Grades 12–13',
    title: 'Master A/L ICT, on your schedule.', support: 'ඕනෑම වෙලාවක, ඕනෑම තැනක ඉගෙන ගන්න',
    description: 'A complete online Grade 12–13 syllabus with lessons students can revisit whenever they need them.',
    action: 'Choose your medium', finalTitle: 'Start your A/L ICT learning path.'
  }
};

const mediumCode = (course) => {
  const code = String(course.medium?.code || '').toLowerCase();
  return ['sinhala', 'si'].includes(code) ? 'si' : ['english', 'en'].includes(code) ? 'en' : code;
};
const courseGrade = (course) => String(course.grade || course.academicLevel?.code || course.title || '').match(/(?:GRADE_?)?(6|7|8|9|10|11|12|13)/i)?.[1] || '';
const areaPrice = (area) => area === 'AL' ? 'LKR 2,500' : area === 'OL' ? 'LKR 2,000' : 'LKR 1,500';

const Hero = ({ area }) => {
  const info = AREAS[area];
  return <section className="public-hero" aria-labelledby={`${area.toLowerCase()}-hero-title`}>
    <div className="public-hero-copy">
      <p className="eyebrow">{info.label}</p>
      <h1 id={`${area.toLowerCase()}-hero-title`}>{info.title}</h1>
      <p className="hero-language-note" lang="si">{info.support}</p>
      <p>{info.description}</p>
      <div className="hero-actions"><a className="button" href="#course-selection" onClick={() => trackPublicEvent('academic_landing_cta_clicked', { area, placement: 'hero' })}>{info.action}</a>{area === 'AL' ? <a className="quiet-link" href="#how-it-works">How it works ↓</a> : null}</div>
    </div>
    <div className="public-hero-media"><img alt="Students learning ICT together" fetchPriority="high" height="900" src={info.image} width="1200" /></div>
  </section>;
};

const CourseCards = ({ area, courses, loading, error, onRetry, matches }) => {
  if (loading) return <LoadingSkeleton label="Loading published courses" />;
  if (error) return <InlineError error={error} onRetry={onRetry} />;
  const visibleCourses = courses.filter(matches);
  return visibleCourses.length ? <div className="catalogue-course-grid landing-course-grid">{visibleCourses.map((course) => <CatalogueCourseCard area={area} course={course} key={course.id} />)}</div> : <EmptyState title="This course is coming soon"><p>We’ll show it here as soon as it is published.</p></EmptyState>;
};

const TrustBar = () => <section className="trust-bar" aria-label="Online learning benefits"><span>100% online learning</span><span>Study anytime</span><span>Learn from anywhere</span><span>Progress saved</span></section>;

const LandingContent = ({ area }) => {
  const info = AREAS[area];
  return <>
    <TrustBar />
    <section className="home-section value-section"><div><p className="eyebrow">Learn around your life</p><h2>Study anytime. Learn anywhere. Stay on track.</h2><p>Every lesson is online and ready when the student is. Start with available free content, return to lessons when needed, and keep progress in one place.</p></div><aside><span>Full lesson price</span><LessonPrice area={area} /><small>Free content may be available before purchase.</small></aside></section>
    <section className="home-section learning-steps" id="how-it-works"><p className="eyebrow">How it works</p><h2>Choose. Preview. Learn. Continue.</h2><div>{[['01', 'Pick your grade', 'Choose the learning stage that matches school.'], ['02', 'Choose your medium', 'Select Sinhala Medium or English Medium.'], ['03', 'Preview first', 'See available course and free lesson content.'], ['04', 'Save your progress', 'Sign in when you are ready to continue learning.']].map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section className="home-section tutor-preview tutor-panel"><div className="tutor-image-frame"><img alt="WARR Wijesinghe, ICT Educator and Software Engineer" className="tutor-image" height="720" loading="lazy" src="/images/aplus-ict-tutor.png" width="720" /></div><div><p className="eyebrow">Meet your tutor</p><h2>WARR Wijesinghe</h2><p className="tutor-role">ICT Educator · Software Engineer</p><p>Clear explanations, practical thinking and a structured learning path for Sri Lankan school students.</p><Link className="quiet-link" to="/about">About your tutor →</Link></div></section>
    <section className="home-section faq-section"><p className="eyebrow">Questions, answered</p><h2>Before you begin</h2><div className="faq-list">{[['Can I try it before buying?', 'Yes. A lesson can include selected free content before the full lesson is purchased.'], ['Can I buy a single lesson?', `Yes. A full lesson for this learning area is ${areaPrice(area)}.`], ['Is progress saved?', 'Yes. Progress is saved after student sign-in.']].map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>
    <section className="final-home-cta"><div><p className="eyebrow">Ready when you are</p><h2>{info.finalTitle}</h2></div><a className="button secondary" href="#course-selection">{info.action}</a></section>
  </>;
};

const AcademicLandingPage = ({ area }) => {
  const [grade, setGrade] = useState('');
  const [medium, setMedium] = useState('');
  const info = AREAS[area];
  const catalogue = useQuery({ queryKey: queryKeys.content.publicCourses(), queryFn: ({ signal }) => contentApi.publicCourses({}, signal), staleTime: 60_000, retry: 1 });
  const courses = (catalogue.data?.data || []).filter((course) => academicAreaForCourse(course) === area);
  const setGradeSelection = (value) => { setGrade(value); trackPublicEvent('grade_selected', { area, grade: value }); };
  const setMediumSelection = (value) => { setMedium(value); trackPublicEvent('medium_selected', { area, medium: value }); };
  const selectedSchoolCourse = grade && medium ? courses.find((course) => courseGrade(course) === grade && mediumCode(course) === medium) : null;
  usePageSeo({ path: info.path, image: info.image, structuredData: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: info.title } });
  return <><Hero area={area} /><LandingContent area={area} /><section className="home-section course-picker" id="course-selection"><p className="eyebrow">Find your course</p><h2>{area === 'SCHOOL' ? 'Start with the student’s grade.' : info.action}</h2>
    {area === 'SCHOOL' ? <><div className="guided-selectors"><fieldset><legend>1. Choose grade</legend>{['6', '7', '8', '9'].map((value) => <button aria-pressed={grade === value} className={grade === value ? 'selected' : ''} key={value} onClick={() => setGradeSelection(value)} type="button">Grade {value}</button>)}</fieldset><fieldset><legend>2. Choose medium</legend><button aria-pressed={medium === 'si'} className={medium === 'si' ? 'selected' : ''} onClick={() => setMediumSelection('si')} type="button" lang="si">සිංහල මාධ්‍යය</button><button aria-pressed={medium === 'en'} className={medium === 'en' ? 'selected' : ''} onClick={() => setMediumSelection('en')} type="button">English Medium</button></fieldset></div>{!grade || !medium ? <p className="selection-status">Select both options to see the matching course.</p> : selectedSchoolCourse ? <div className="selected-course"><CatalogueCourseCard area={area} course={selectedSchoolCourse} /></div> : <EmptyState title="This course is coming soon"><p>The planned full lesson price is LKR 1,500.</p></EmptyState>}</> : <><div className="filter-bar" aria-label="Course filters">{area === 'OL' ? <div>{['10', '11'].map((value) => <button aria-pressed={grade === value} className={grade === value ? 'selected' : ''} key={value} onClick={() => setGradeSelection(grade === value ? '' : value)} type="button">Grade {value}</button>)}</div> : null}<div><button aria-pressed={medium === 'si'} className={medium === 'si' ? 'selected' : ''} onClick={() => setMediumSelection(medium === 'si' ? '' : 'si')} type="button" lang="si">සිංහල මාධ්‍යය</button><button aria-pressed={medium === 'en'} className={medium === 'en' ? 'selected' : ''} onClick={() => setMediumSelection(medium === 'en' ? '' : 'en')} type="button">English Medium</button></div></div><CourseCards area={area} courses={courses} error={catalogue.error} loading={catalogue.isPending} matches={(course) => (!grade || courseGrade(course) === grade) && (!medium || mediumCode(course) === medium)} onRetry={catalogue.refetch} /></>}</section></>;
};

const PATHWAYS = [
  ['SCHOOL', '01', 'Grades 6–9', 'Build strong ICT foundations.', 'Learn the practical skills that make every next grade easier.', '/images/study-cta.jpg'],
  ['OL', '02', 'O/L ICT', 'Prepare confidently for O/L ICT.', 'Connect Grade 10 and 11 learning with focused practical preparation.', '/images/ict-practice.jpg'],
  ['AL', '03', 'A/L ICT', 'Master the A/L ICT syllabus.', 'Take the complete syllabus one lesson at a time.', '/images/learning-hero.jpg']
];

const ResourcePreview = () => {
  const resources = useQuery({ queryKey: queryKeys.content.publicDownloads({ accessPolicy: 'free' }), queryFn: ({ signal }) => resourceApi.publicDownloads({ accessPolicy: 'free' }, signal), staleTime: 60_000, retry: 1 });
  const items = resources.data?.data?.items || [];
  return items.length ? <section className="home-section resource-callout"><p className="eyebrow">Free resources</p><h2>Useful ICT learning materials, ready to explore.</h2><Link className="quiet-link" to="/resources">Browse free resources →</Link></section> : null;
};

export const PlatformHomePage = () => {
  const { isAuthenticated, user } = useAuth();
  usePageSeo({ path: '/', structuredData: { '@context': 'https://schema.org', '@graph': [{ '@type': 'WebSite', name: 'A Plus ICT', url: new URL('/', import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin).toString() }, { '@type': 'EducationalOrganization', name: 'A Plus ICT', url: new URL('/', import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin).toString() }] } });
  return <><section className="public-hero platform-home-hero" aria-labelledby="home-hero-title"><div className="public-hero-copy"><p className="eyebrow">Sri Lanka school ICT · Grades 6–13</p><h1 id="home-hero-title">School ICT learning—anytime, anywhere.</h1><p className="hero-language-note" lang="si">ඕනෑම වෙලාවක, ඕනෑම තැනක ඉගෙන ගන්න</p><p>A complete online ICT learning platform aligned with Sri Lankan school syllabus. Choose your grade, learn at your pace, and return whenever you need to.</p><div className="hero-actions"><a className="button" href="#pathways">Start learning online</a><Link className="quiet-link" to={isAuthenticated ? destinationForUser(user) : '/login'}>{isAuthenticated ? 'Go to My Learning →' : 'Student login →'}</Link></div></div><div className="public-hero-media"><img alt="Sri Lankan students collaborating in an ICT lesson" fetchPriority="high" height="900" src="/images/platform-learning-journey.webp" width="1600" /></div></section>
    <TrustBar /><section className="home-section pathways-section" id="pathways"><p className="eyebrow">Choose your stage</p><h2>Choose the ICT path that fits your school year.</h2><p>Start with the stage you are in today, then choose your medium on the next screen.</p><div className="platform-pathway-grid">{PATHWAYS.map(([area, number, title, heading, description, image]) => <Link className="platform-pathway" key={area} onClick={() => trackPublicEvent('homepage_pathway_selected', { pathway: area.toLowerCase() })} to={AREAS[area].path}><img alt="" height="240" loading="lazy" src={image} width="400" /><div className="pathway-card-content"><span className="pathway-number">{number}</span><p className="eyebrow">{title}</p><h3>{heading}</h3><p>{description}</p><span className="pathway-card-footer">Explore {title} <b aria-hidden="true">→</b></span></div></Link>)}</div></section>
    <section className="home-section value-section home-value"><div><p className="eyebrow">Why A Plus ICT</p><h2>School ICT that works around your day.</h2><p>Learn online at home, after school, or wherever the student is ready. The lesson path is always there when it is time to continue.</p></div><div className="value-points"><span>Online lessons, always available</span><span>Study on your schedule</span><span>Learn from any place</span><span>Progress picks up where you stopped</span></div></section>
    <section className="home-section tutor-preview tutor-panel"><div className="tutor-image-frame"><img alt="WARR Wijesinghe, ICT Educator and Software Engineer" className="tutor-image" height="720" loading="lazy" src="/images/aplus-ict-tutor.png" width="720" /></div><div><p className="eyebrow">Meet your tutor</p><h2>WARR Wijesinghe</h2><p className="tutor-role">ICT Educator · Software Engineer</p><p>Clear explanations, practical thinking and a structured learning path for Sri Lankan school students.</p><Link className="quiet-link" to="/about">About your tutor →</Link></div></section><ResourcePreview /><section className="home-section faq-section"><p className="eyebrow">Need to know</p><h2>Quick answers before you start.</h2><div className="faq-list">{[['Can I choose a course by grade?', 'Yes. Start by selecting the school stage that matches the student.'], ['Are the mediums separate?', 'Yes. Sinhala Medium and English Medium follow separate course paths.'], ['Can I preview before buying?', 'Available free content is shown before full lesson purchase.']].map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section></>;
};

export const AlIctPage = () => <AcademicLandingPage area="AL" />;
export const OlIctPage = () => <AcademicLandingPage area="OL" />;
export const SchoolIctPage = () => <AcademicLandingPage area="SCHOOL" />;
