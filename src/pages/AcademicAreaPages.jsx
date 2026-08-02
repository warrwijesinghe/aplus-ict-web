import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { contentApi } from '../api/content.api.js';
import { queryKeys } from '../api/query-keys.js';
import { useAuth } from '../auth/auth-context.jsx';
import { CatalogueCourseCard } from '../components/catalogue/CatalogueUi.jsx';
import { EmptyState, InlineError, LoadingSkeleton } from '../components/common/States.jsx';
import { academicAreaForCourse } from '../config/lesson-pricing.js';
import { gradeForCourse, mediumForCourse } from '../utils/academic-course.js';
import { usePageSeo } from '../seo/use-page-seo.js';
import { destinationForUser } from '../utils/route-destination.js';
import { trackPublicEvent } from '../analytics/events.js';

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

const PATHWAYS = [
  {
    area: 'SCHOOL',
    stage: 'Grades 6–9',
    title: 'School ICT',
    titleSi: '6–9 ශ්‍රේණි ICT',
    description: 'Build a strong ICT foundation through grade-based lessons, activities and practical digital skills.',
    action: 'Choose My Grade',
    actionSi: 'මගේ ශ්‍රේණිය තෝරන්න',
    path: '/school-ict',
    image: '/images/learning-places/school-desk.webp',
    imageAlt: 'Younger student learning ICT using a laptop'
  },
  {
    area: 'OL',
    stage: 'Grades 10–11',
    title: 'O/L ICT',
    titleSi: 'සාමාන්‍ය පෙළ ICT',
    description: 'Learn theory, practical ICT skills and examination-focused lessons for Grades 10 and 11.',
    action: 'Explore O/L ICT',
    actionSi: 'O/L ICT පාඨමාලා බලන්න',
    path: '/ol-ict',
    image: '/images/learning-places/study-desk.webp',
    imageAlt: 'Student studying ICT notes beside a laptop'
  },
  {
    area: 'AL',
    stage: 'Grades 12–13',
    title: 'A/L ICT',
    titleSi: 'උසස් පෙළ ICT',
    description: 'Master all 13 ICT competencies through structured lessons, activities and examination preparation.',
    action: 'Explore A/L ICT',
    actionSi: 'A/L ICT පාඨමාලා බලන්න',
    path: '/al-ict',
    image: '/images/learning-places/lesson-study.webp',
    imageAlt: 'Advanced-level student learning ICT on a computer'
  }
];

const LessonPlayerPreview = () => (
  <div className="lesson-player-preview" aria-label="A Plus ICT lesson player preview">
    <div className="lesson-player-topline"><span>A Plus ICT</span><span>Lesson 03</span></div>
    <div className="lesson-player-screen"><span>▶</span><p>Understanding computer systems</p></div>
    <div className="lesson-player-progress"><span /><small>Lesson progress · 42%</small></div>
    <div className="lesson-player-list"><b>01</b><span>Introduction to ICT</span><b className="active">02</b><span>Computer systems</span><b>03</b><span>Practice activity</span></div>
  </div>
);

const Hero = ({ area, home = false }) => {
  const info = home ? {
    label: 'Online school ICT learning platform · Grades 6–13',
    title: 'Study ICT Anytime. Anywhere.',
    description: 'Learn the Sri Lankan school ICT syllabus through structured video lessons, learning materials, activities, and progress tracking—at your own pace, on any device.',
    support: 'ඔබේ වේලාවට. ඔබේ වේගයට. ඕනෑම තැනකින්.'
  } : AREAS[area];
  return <section className={`public-hero ${home ? 'platform-home-hero' : ''}`} aria-labelledby={`${home ? 'home' : area.toLowerCase()}-hero-title`}>
    <div className="public-hero-copy">
      <p className="eyebrow">{info.label}</p>
      <h1 id={`${home ? 'home' : area.toLowerCase()}-hero-title`}>{info.title}</h1>
      <p className="hero-language-note" lang="si">{info.support}</p>
      <p>{info.description}</p>
      <div className="hero-actions">
        {home ? <a className="button" href="#pathways">Choose Your Grade</a> : <a className="button" href="#course-selection">{info.action}</a>}
        <Link className="button secondary" to={home ? '/free-lessons' : '/free-lessons'}>{home ? 'Start a Free Lesson' : 'Start Learning Free'}</Link>
      </div>
      {home ? <ul className="hero-assurances"><li>Learn on phone, tablet, or computer</li><li>Pause, replay, and continue anytime</li><li>Free lessons available to begin</li></ul> : null}
      {home ? <p className="hero-trust">No fixed timetable · Learn from any device · Free lessons available</p> : null}
    </div>
    <div className="public-hero-media">
      <img alt="Student learning online with a laptop" fetchPriority={home ? 'high' : undefined} height="810" loading={home ? 'eager' : undefined} sizes={home ? '(min-width: 1024px) 100vw, 100vw' : '(min-width: 768px) 50vw, 100vw'} src={home ? '/images/learning-places/home-hero-student.webp' : info.image} width="1440" />
      {home ? <LessonPlayerPreview /> : null}
    </div>
  </section>;
};

const ValueStrip = () => <section className="benefit-strip" aria-label="A Plus ICT learning benefits">
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

const HomeFaq = () => <section className="home-section faq-section"><p className="eyebrow">Frequently asked questions</p><h2>Everything you need to know before you start</h2><div className="faq-list">{[
  ['Who can learn with A Plus ICT?', 'A Plus ICT provides online ICT learning for students from Grade 6 through Grade 13, including School ICT, O/L ICT, and A/L ICT.'],
  ['Can I learn using a mobile phone?', 'Yes. The platform is designed to work across phones, tablets, laptops, and desktop computers.'],
  ['Are lessons available in Sinhala and English Medium?', 'Learning paths are organised separately for Sinhala Medium and English Medium students where content is available.'],
  ['Do I need an account for free lessons?', 'Students sign in using Google so lesson access and learning progress can be maintained.'],
  ['Are free lessons available?', 'Available free lesson content is clearly shown before a student unlocks any paid lesson content.'],
  ['How is progress calculated?', 'Progress is based only on activities that are available to your student account. Locked activities never reduce free-learning progress.']
].map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>;

export const PlatformHomePage = () => {
  const { isAuthenticated, user } = useAuth();
  usePageSeo({ path: '/', structuredData: { '@context': 'https://schema.org', '@type': 'EducationalOrganization', name: 'A Plus ICT' } });
  return <>
    <Hero home />
    <ValueStrip />
    <section className="home-section pathways-section" id="pathways">
      <p className="eyebrow">Choose Your Learning Path</p>
      <h2>Start ICT Learning at Your School Stage</h2>
      <p className="pathways-sinhala" lang="si">ඔබේ ශ්‍රේණියට ගැළපෙන ICT ඉගෙනුම් මාර්ගය තෝරන්න.</p>
      <p className="pathways-intro">Choose your current school stage and continue to the correct grade and medium.</p>
      <div className="learning-path-grid">{PATHWAYS.map((item) => <Link className={`learning-path-card learning-path-card-${item.area.toLowerCase()}`} key={item.area} onClick={() => trackPublicEvent('homepage_pathway_selected', { academic_area: item.area.toLowerCase() })} to={item.path}>
        <div className="learning-path-image"><img alt={item.imageAlt} height="500" loading="lazy" src={item.image} width="760" /><span className="learning-path-stage">{item.stage}</span></div>
        <div className="learning-path-content"><div className="learning-path-heading"><h3>{item.title}</h3><p className="learning-path-title-si" lang="si">{item.titleSi}</p></div><p className="learning-path-description">{item.description}</p><span className="learning-path-action"><span><strong>{item.action}</strong><small lang="si">{item.actionSi}</small></span><span className="learning-path-arrow" aria-hidden="true">→</span></span></div>
      </Link>)}</div>
    </section>
    <section className="home-section learning-steps"><p className="eyebrow">A simple learning journey</p><h2>Start Learning in Four Simple Steps</h2><div>{[['01', 'Choose Your Grade', 'Select School ICT, O/L ICT, or A/L ICT.'], ['02', 'Select Your Medium', 'Choose the Sinhala Medium or English Medium course available for your level.'], ['03', 'Sign In with Google', 'Use one secure student account to access free and purchased lessons.'], ['04', 'Learn and Continue', 'Watch lessons, use learning materials, complete activities, and track your progress.']].map(([number, heading, copy]) => <article key={number}><span>{number}</span><h3>{heading}</h3><p>{copy}</p></article>)}</div><p className="section-action"><a className="button" href="#pathways">Find My ICT Course</a></p></section>
    <section className="home-section platform-features"><p className="eyebrow">One organised learning platform</p><h2>Everything you need in one lesson flow</h2><div>{[['Structured Video Lessons', 'Follow lessons in the correct syllabus order instead of searching through unrelated videos.'], ['Notes and PDFs', 'Keep lesson notes, PDFs, examples, and revision material together.'], ['Activities and Quizzes', 'Practise what you learn and see what to do next.'], ['Free and Unlocked Content', 'Begin with available free content and unlock more without leaving the lesson flow.'], ['Progress Tracking', 'Continue from where you stopped across your devices.']].map(([heading, copy]) => <article key={heading}><h3>{heading}</h3><p>{copy}</p></article>)}</div></section>
    <section className="home-tutor-section" aria-labelledby="educator-title">
      <div className="home-tutor-media">
        <div className="home-tutor-image-frame">
          <img alt="WARR Wijesinghe, ICT Educator and Founder of A Plus ICT" className="home-tutor-image" height="760" loading="lazy" src="/images/aplus-ict-tutor.png" width="620" />
        </div>
      </div>
      <div className="home-tutor-content">
        <p className="eyebrow">Meet Your ICT Educator</p>
        <h2 id="educator-title">ICT Learning Designed by an Educator and Software Engineer</h2>
        <p className="home-tutor-sinhala" lang="si">සංකීර්ණ ICT සංකල්ප සරලව, ක්‍රමානුකූලව ඉගෙන ගන්න.</p>
        <div className="home-tutor-identity">
          <h3>WARR Wijesinghe</h3>
          <p>ICT Educator · Software Engineer · Founder, A Plus ICT</p>
        </div>
        <p className="home-tutor-intro">A Plus ICT combines classroom experience with software engineering to make the Sri Lankan school ICT syllabus easier to understand, practise and continue from anywhere.</p>
        <ul className="home-tutor-benefits">
          <li>Structured learning from Grade 6 to A/L</li>
          <li>Sinhala and English Medium support</li>
          <li>Lessons organised around the official school ICT syllabus</li>
        </ul>
        <div className="home-tutor-qualification">
          <span>Selected Qualifications</span>
          <p>B.Sc. Business Administration (Information Systems Special), USJP · Postgraduate Diploma, British Computer Society · CCNA · HDIT (UCSC)</p>
        </div>
        <Link className="home-tutor-action" to="/about">
          <span><strong>Learn About A Plus ICT</strong><small lang="si">A Plus ICT ගැන වැඩිදුර දැනගන්න</small></span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
    <HomeFaq />
    <section className="final-home-cta"><div><p className="eyebrow">Your next ICT lesson is ready when you are</p><h2>Start now and continue at your own pace.</h2><p lang="si">ඔබට පහසු වේලාවකින් අදම පටන් ගන්න.</p></div><div className="hero-actions"><a className="button secondary" href="#pathways">Choose Your Grade</a><Link className="quiet-link" to={isAuthenticated ? destinationForUser(user) : '/login'}>{isAuthenticated ? 'Continue Learning' : 'Student Login'} →</Link></div></section>
  </>;
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
