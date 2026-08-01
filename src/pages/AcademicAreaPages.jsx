import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { contentApi } from '../api/content.api.js';
import { queryKeys } from '../api/query-keys.js';
import { useAuth } from '../auth/auth-context.jsx';
import { CatalogueCourseCard } from '../components/catalogue/CatalogueUi.jsx';
import { EmptyState, InlineError, LoadingSkeleton } from '../components/common/States.jsx';
import { academicAreaForCourse } from '../config/lesson-pricing.js';
import { usePageSeo } from '../seo/use-page-seo.js';
import { destinationForUser } from '../utils/route-destination.js';

const AREAS = {
  SCHOOL: {
    path: '/school-ict',
    image: '/images/learning-places/school-desk.webp',
    label: 'School ICT · Grades 6–9',
    title: 'Build Strong ICT Skills from Grade 6',
    description: 'Develop practical digital knowledge and a strong ICT foundation through lessons organised for each school grade.',
    support: 'ICT පදනම නිවැරදිව ගොඩනගමූ.',
    action: 'Choose Your Grade'
  },
  OL: {
    path: '/ol-ict',
    image: '/images/learning-places/home-study-notes.webp',
    label: 'G.C.E. O/L ICT · Grades 10–11',
    title: 'Master O/L ICT One Syllabus Unit at a Time',
    description: 'Understand theory, strengthen practical knowledge, and prepare for the examination through a clear, structured online learning path.',
    support: 'පාඩමෙන් පාඩමට විශ්වාසයෙන් ඉදිරියට යමු.',
    action: 'Explore O/L ICT Courses'
  },
  AL: {
    path: '/al-ict',
    image: '/images/learning-places/lesson-study.webp',
    label: 'G.C.E. A/L ICT · Grades 12–13',
    title: 'Learn All 13 A/L ICT Competencies at Your Own Pace',
    description: 'Follow the complete A/L ICT syllabus through clearly organised video lessons, learning materials, activities, and exam-focused guidance.',
    support: 'සංකීර්ණ ICT සංකල්ප සරලව තේරුම් ගනිමු.',
    action: 'Choose Your Medium'
  }
};

const PATHWAYS = [
  ['SCHOOL', 'Grades 6–9', 'School ICT', 'Build the ICT foundation needed for school, future examinations, and the modern digital world.', 'Explore Grades 6–9'],
  ['OL', 'Grades 10–11', 'O/L ICT', 'Understand every syllabus unit, strengthen practical knowledge, and prepare confidently for the O/L examination.', 'Explore O/L ICT'],
  ['AL', 'Grades 12–13', 'A/L ICT', 'Master the complete syllabus through structured explanations, activities, and exam-focused learning.', 'Explore A/L ICT']
];

const gradeForCourse = (course) => String(course.grade || course.academicLevel?.code || course.title || '').match(/(?:GRADE_?)?(6|7|8|9|10|11|12|13)/i)?.[1] || '';
const mediumForCourse = (course) => {
  const value = String(course.medium?.code || '').toLowerCase();
  return ['sinhala', 'si'].includes(value) ? 'si' : ['english', 'en'].includes(value) ? 'en' : value;
};

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
      <img alt="Student learning online at home using a laptop" fetchPriority="high" height="900" src={home ? '/images/home-hero-learn-online.jpg' : info.image} width="1600" />
      {home ? <LessonPlayerPreview /> : null}
    </div>
  </section>;
};

const ValueStrip = () => <section className="benefit-strip" aria-label="A Plus ICT benefits">
  <div><strong>Grades 6–13</strong><span>School, O/L and A/L ICT</span></div>
  <div><strong>Two Mediums</strong><span>Sinhala and English Medium</span></div>
  <div><strong>Any Device</strong><span>Phone, tablet or computer</span></div>
  <div><strong>Your Own Pace</strong><span>Pause, replay and continue anytime</span></div>
</section>;

const CourseCards = ({ area, courses, loading, error, matches }) => {
  if (loading) return <LoadingSkeleton label="Loading published courses" />;
  if (error) return <InlineError error={error} />;
  const visible = courses.filter(matches);
  return visible.length ? <div className="catalogue-course-grid landing-course-grid">{visible.map((course) => <CatalogueCourseCard area={area} course={course} key={course.id} />)}</div> : <EmptyState title="Courses will appear here as they are published"><p>Choose a different grade or medium, or check back soon.</p></EmptyState>;
};

const LearningPlacesGallery = () => <section className="home-section learning-places-section">
  <div className="learning-places-intro">
    <p className="eyebrow">Learning that moves with you</p>
    <h2>Study Anytime. Anywhere.</h2>
    <p>A quiet desk at home, a break outside, or a familiar place between plans—your ICT lesson is ready when you are.</p>
  </div>
  <div className="learning-places-gallery">
    <article className="learning-place learning-place-feature"><img alt="Student studying online at home with headphones" loading="lazy" src="/images/learning-places/home-learning.webp" /><div><span>At home</span><h3>Your study space, your pace</h3></div></article>
    <article className="learning-place"><img alt="Student learning outdoors using a laptop" loading="lazy" src="/images/learning-places/outdoor-study.webp" /><div><span>Outside</span><h3>Learn wherever you settle in</h3></div></article>
    <article className="learning-place"><img alt="Student studying online in a cafe" loading="lazy" src="/images/learning-places/cafe-laptop.webp" /><div><span>Between plans</span><h3>Make time work for you</h3></div></article>
    <article className="learning-place"><img alt="Student studying online from a comfortable sofa" loading="lazy" src="/images/learning-places/sofa-study.webp" /><div><span>Comfortably</span><h3>Continue from any device</h3></div></article>
    <article className="learning-place"><img alt="Student joining an online learning session" loading="lazy" src="/images/learning-places/online-session.webp" /><div><span>Connected</span><h3>Keep every lesson within reach</h3></div></article>
  </div>
</section>;

const HomeFaq = () => <section className="home-section faq-section"><p className="eyebrow">Frequently asked questions</p><h2>Everything you need to know before you start</h2><div className="faq-list">{[
  ['Who can learn with A Plus ICT?', 'A Plus ICT provides online ICT learning for students from Grade 6 through Grade 13, including School ICT, O/L ICT, and A/L ICT.'],
  ['Can I learn using a mobile phone?', 'Yes. The platform is designed to work across phones, tablets, laptops, and desktop computers.'],
  ['Are lessons available in Sinhala and English Medium?', 'Learning paths are organised separately for Sinhala Medium and English Medium students where content is available.'],
  ['Do I need an account for free lessons?', 'Students sign in using Google so lesson access and learning progress can be maintained.'],
  ['Can I learn at any time?', 'Yes. Lessons are available online, allowing students to study according to their own schedules.']
].map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>;

export const PlatformHomePage = () => {
  const { isAuthenticated, user } = useAuth();
  usePageSeo({ path: '/', structuredData: { '@context': 'https://schema.org', '@type': 'EducationalOrganization', name: 'A Plus ICT' } });
  return <>
    <Hero home />
    <ValueStrip />
    <section className="home-section pathways-section" id="pathways"><p className="eyebrow">Choose your learning path</p><h2>ICT Learning for Every School Stage</h2><p>Choose your current grade and start with lessons created around the Sri Lankan school ICT syllabus.</p><div className="platform-pathway-grid">{PATHWAYS.map(([area, stage, title, description, action]) => <Link className="platform-pathway" key={area} to={AREAS[area].path}><img alt="" height="240" loading="lazy" src={AREAS[area].image} width="400" /><div className="pathway-card-content"><p className="eyebrow">{stage}</p><h3>{title}</h3><p>{description}</p><span className="pathway-card-footer">{action} <b aria-hidden="true">→</b></span></div></Link>)}</div></section>
    <section className="home-section life-section"><div><p className="eyebrow">Learning that fits your life</p><h2>Your Timetable Should Not Limit Your Learning</h2><p>School, tuition, travel, and daily responsibilities can make it difficult to follow another fixed timetable. A Plus ICT lets you learn whenever you are ready.</p><p>Study after school. Continue at night. Revise during the weekend. Replay a difficult explanation until it becomes clear.</p><p className="hero-language-note" lang="si">වේලාව මඟහැරුණත් පාඩම මඟහැරෙන්නේ නැහැ.</p></div><div className="life-feature-list">{[['Learn on Your Schedule', 'Open the lesson when you have time and continue from where you stopped.'], ['Replay Until It Is Clear', 'Pause, rewind, and watch an explanation again without pressure.'], ['Learn on Any Device', 'Move between your phone, tablet, and computer while keeping the same learning journey.'], ['Follow Your Progress', 'See completed lessons and understand what you should study next.']].map(([heading, copy]) => <article key={heading}><h3>{heading}</h3><p>{copy}</p></article>)}</div></section>
    <LearningPlacesGallery />
    <section className="home-section learning-steps"><p className="eyebrow">A simple learning journey</p><h2>Start Learning in Four Simple Steps</h2><div>{[['01', 'Choose Your Grade', 'Select School ICT, O/L ICT, or A/L ICT.'], ['02', 'Select Your Medium', 'Choose the Sinhala Medium or English Medium course available for your level.'], ['03', 'Sign In with Google', 'Use one secure student account to access free and purchased lessons.'], ['04', 'Learn and Continue', 'Watch lessons, use learning materials, complete activities, and track your progress.']].map(([number, heading, copy]) => <article key={number}><span>{number}</span><h3>{heading}</h3><p>{copy}</p></article>)}</div><p className="section-action"><a className="button" href="#pathways">Find My ICT Course</a></p></section>
    <section className="home-section platform-features"><p className="eyebrow">More than video lessons</p><h2>Everything Organised in One Learning Platform</h2><div>{[['Structured Video Lessons', 'Follow lessons in the correct syllabus order instead of searching through unrelated videos.'], ['Notes and Learning Materials', 'Access lesson-related notes, PDFs, examples, and revision material from the same page.'], ['Free and Premium Learning', 'Start with available free content and unlock additional lessons when you are ready.'], ['One Continuous Lesson Path', 'Free and premium chapters remain in one organised lesson flow.'], ['Progress Tracking', 'See how much of the available course content you have completed.'], ['Easy Google Login', 'Access your learning account without remembering another password.']].map(([heading, copy]) => <article key={heading}><h3>{heading}</h3><p>{copy}</p></article>)}</div></section>
    <section className="home-section scenario-section"><p className="eyebrow">Learn ICT around your day</p><h2>Ready when you are</h2><div>{[['Missed a class?', 'Open the lesson when you return home.'], ['A concept is difficult?', 'Replay the explanation and study it step by step.'], ['Preparing for an examination?', 'Return directly to the unit you need to revise.'], ['Travelling or away from home?', 'Continue learning from your phone or tablet.']].map(([heading, copy]) => <article key={heading}><h3>{heading}</h3><p>{copy}</p></article>)}</div><Link className="button" to="/free-lessons">Start Learning at Your Own Pace</Link></section>
    <section className="home-section free-learning"><p className="eyebrow">Start before you pay</p><h2>Explore Free ICT Lessons and Resources</h2><p>Create your student account and begin with available free lessons, notes, and revision resources. Experience the learning platform before unlocking premium content.</p><div className="hero-actions"><Link className="button" to="/free-lessons">Start a Free Lesson</Link><Link className="button secondary" to="/resources">Browse Free Resources</Link></div></section>
    <section className="home-section tutor-preview tutor-panel"><div className="tutor-image-frame"><img alt="WARR Wijesinghe, ICT Educator and Software Engineer" className="tutor-image" height="720" loading="lazy" src="/images/aplus-ict-tutor.png" width="720" /></div><div><p className="eyebrow">Guided by education and technology</p><h2>ICT Learning Designed by a Teacher and Software Engineer</h2><p>A Plus ICT is developed by WARR Wijesinghe to make school ICT easier to access, understand, and continue.</p><p>The objective is not simply to publish videos. It is to give every student a clear and organised path through school ICT.</p><Link className="quiet-link" to="/about">Learn About A Plus ICT →</Link></div></section>
    <HomeFaq />
    <section className="final-home-cta"><div><p className="eyebrow">Your next ICT lesson is ready when you are</p><h2>Start now and continue at your own pace.</h2><p lang="si">ඔබට පහසු වේලාවකින් අදම පටන් ගන්න.</p></div><div className="hero-actions"><a className="button secondary" href="#pathways">Choose Your Grade</a><Link className="quiet-link" to={isAuthenticated ? destinationForUser(user) : '/login'}>{isAuthenticated ? 'Continue Learning' : 'Student Login'} →</Link></div></section>
  </>;
};

const AreaSupport = ({ area }) => {
  if (area === 'SCHOOL') return <section className="home-section grade-roadmap"><p className="eyebrow">Choose your grade</p><h2>Start with the grade you are in now</h2><div>{[['6', 'Start your ICT journey with basic computer concepts, safe technology use, and essential digital skills.'], ['7', 'Continue building practical knowledge and learn how digital systems are used in everyday life.'], ['8', 'Strengthen your understanding through structured concepts, activities, and practical applications.'], ['9', 'Prepare for upper-school ICT with stronger digital, logical, and problem-solving skills.']].map(([grade, copy]) => <Link key={grade} to="#course-selection"><span>Grade {grade}</span><p>{copy}</p><b>View Grade {grade} →</b></Link>)}</div></section>;
  if (area === 'OL') return <section className="home-section checklist-section"><p className="eyebrow">Complete O/L ICT Preparation in One Place</p><h2>A clear path for Grades 10 and 11</h2><ul>{['Grade 10 and Grade 11 syllabus coverage', 'Sinhala Medium and English Medium learning paths', 'Structured video explanations', 'Notes and lesson materials', 'Practical ICT guidance', 'Revision and examination-focused content', 'Student progress tracking'].map((item) => <li key={item}>{item}</li>)}</ul></section>;
  return <section className="home-section competency-section"><p className="eyebrow">A clear path through the complete A/L ICT syllabus</p><h2>Every competency in official syllabus order</h2><p>Published competency cards show the available medium, chapters, free content, your progress after sign-in, and the next suitable action: Start, Continue, Review, or Unlock.</p></section>;
};

const AcademicLandingPage = ({ area }) => {
  const [grade, setGrade] = useState('');
  const [medium, setMedium] = useState('');
  const info = AREAS[area];
  const catalogue = useQuery({ queryKey: queryKeys.content.publicCourses(), queryFn: ({ signal }) => contentApi.publicCourses({}, signal), staleTime: 60_000, retry: 1 });
  const courses = (catalogue.data?.data || []).filter((course) => academicAreaForCourse(course) === area);
  usePageSeo({ path: info.path, image: info.image, structuredData: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: info.title } });
  const grades = area === 'SCHOOL' ? ['6', '7', '8', '9'] : area === 'OL' ? ['10', '11'] : [];
  return <><Hero area={area} /><ValueStrip /><AreaSupport area={area} />
    <section className="home-section course-picker" id="course-selection"><p className="eyebrow">Find your course</p><h2>{area === 'SCHOOL' ? 'Choose your grade and medium' : info.action}</h2><p>Select the available learning path that suits you.</p><div className="guided-selectors">{grades.length ? <fieldset><legend>Choose grade</legend>{grades.map((value) => <button aria-pressed={grade === value} className={grade === value ? 'selected' : ''} key={value} onClick={() => setGrade(value)} type="button">Grade {value}</button>)}</fieldset> : null}<fieldset><legend>Choose medium</legend><button aria-pressed={medium === 'si'} className={medium === 'si' ? 'selected' : ''} onClick={() => setMedium('si')} type="button" lang="si">සිංහල මාධ්‍යය</button><button aria-pressed={medium === 'en'} className={medium === 'en' ? 'selected' : ''} onClick={() => setMedium('en')} type="button">English Medium</button></fieldset></div><CourseCards area={area} courses={courses} error={catalogue.error} loading={catalogue.isPending} matches={(course) => (!grade || gradeForCourse(course) === grade) && (!medium || mediumForCourse(course) === medium)} /></section>
    <section className="final-home-cta"><div><p className="eyebrow">Learn on your own terms</p><h2>{area === 'AL' ? 'Choose your medium and start your A/L ICT path.' : 'Your next ICT lesson is ready when you are.'}</h2></div><Link className="button secondary" to="/free-lessons">Start a Free Lesson</Link></section>
  </>;
};

export const AlIctPage = () => <AcademicLandingPage area="AL" />;
export const OlIctPage = () => <AcademicLandingPage area="OL" />;
export const SchoolIctPage = () => <AcademicLandingPage area="SCHOOL" />;
