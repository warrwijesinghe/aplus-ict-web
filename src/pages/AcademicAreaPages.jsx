import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { contentApi } from '../api/content.api.js';
import { queryKeys } from '../api/query-keys.js';
import { CatalogueCourseCard } from '../components/catalogue/CatalogueUi.jsx';
import { EmptyState, InlineError, LoadingSkeleton } from '../components/common/States.jsx';
import { academicAreaForCourse } from '../config/lesson-pricing.js';
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
    action: 'Choose Your Grade',
    gallery: [
      ['/images/learning-places/school-online-learning.webp', 'School student learning ICT online'],
      ['/images/learning-places/young-learner.webp', 'Young student developing digital skills'],
      ['/images/learning-places/practical-learning.webp', 'Student practising ICT skills'],
      ['/images/learning-places/school-desk.webp', 'School student studying at a desk'],
      ['/images/learning-places/video-learning.webp', 'Student following a video lesson']
    ]
  },
  OL: {
    path: '/ol-ict',
    image: '/images/learning-places/ol-online-learning.webp',
    label: 'G.C.E. O/L ICT · Grades 10–11',
    title: 'Master O/L ICT One Syllabus Unit at a Time',
    description: 'Understand theory, strengthen practical knowledge, and prepare for the examination through a clear, structured online learning path.',
    support: 'පාඩමෙන් පාඩමට විශ්වාසයෙන් ඉදිරියට යමු.',
    action: 'Explore O/L ICT Courses',
    gallery: [
      ['/images/learning-places/ol-online-learning.webp', 'Student learning O/L ICT online'],
      ['/images/learning-places/lesson-webinar-notes.webp', 'Student following an online ICT lesson'],
      ['/images/learning-places/lesson-study.webp', 'Student reviewing ICT lesson material'],
      ['/images/learning-places/headset-class.webp', 'Student attending an ICT class with headphones'],
      ['/images/learning-places/focused-student.webp', 'Focused student preparing for ICT studies']
    ]
  },
  AL: {
    path: '/al-ict',
    image: '/images/learning-places/al-online-learning.webp',
    label: 'G.C.E. A/L ICT · Grades 12–13',
    title: 'Learn All 13 A/L ICT Competencies at Your Own Pace',
    description: 'Follow the complete A/L ICT syllabus through clearly organised video lessons, learning materials, activities, and exam-focused guidance.',
    support: 'සංකීර්ණ ICT සංකල්ප සරලව තේරුම් ගනිමු.',
    action: 'Choose Your Medium',
    gallery: [
      ['/images/learning-places/al-online-learning.webp', 'Student learning A/L ICT online'],
      ['/images/learning-places/lesson-laptop-focus.webp', 'Student concentrating on an ICT lesson'],
      ['/images/learning-places/lesson-study-notes.webp', 'Student studying ICT notes'],
      ['/images/learning-places/lesson-headset-laptop.webp', 'Student learning with a laptop and headset'],
      ['/images/learning-places/lesson-focused-study.webp', 'Student focused on A/L ICT study']
    ]
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
  return <section aria-labelledby={`${area.toLowerCase()}-hero-title`} className="public-hero academic-landing-hero">
    <div className="academic-landing-hero-inner">
      <div className="public-hero-copy">
        <p className="eyebrow">{info.label}</p>
        <h1 id={`${area.toLowerCase()}-hero-title`}>{info.title}</h1>
        <p className="hero-language-note" lang="si">{info.support}</p>
        <p>{info.description}</p>
        <div className="hero-actions"><a className="button" href="#course-selection">{info.action}</a><Link className="button secondary" to="/free-lessons">Start Learning Free</Link></div>
      </div>
      <div aria-label={`${info.label} student learning gallery`} className="public-hero-media academic-image-grid" role="group">
        {info.gallery.map(([src, alt], index) => <img alt={alt} className={`academic-grid-image academic-grid-image-${index + 1}`} fetchPriority={index === 0 ? 'high' : undefined} height={index === 0 ? '810' : '600'} key={`${src}-${index}`} loading={index === 0 ? 'eager' : 'lazy'} sizes="(min-width: 1024px) 16vw, (min-width: 768px) 20vw, 50vw" src={src} width={index === 0 ? '1440' : '800'} />)}
      </div>
    </div>
  </section>;
};

const learningPathLabels = {
  SCHOOL: { title: 'School ICT', detail: 'Grades 6–9' },
  OL: { title: 'G.C.E. O/L ICT', detail: 'Grades 10–11' },
  AL: { title: 'G.C.E. A/L ICT', detail: 'Grades 12–13' }
};

const LearningPathSwitcher = ({ currentArea }) => <section className="home-section academic-path-switcher" aria-labelledby="learning-path-switcher-title">
  <img alt="Student studying ICT with a laptop and headset" className="academic-path-switcher-image" src="/images/learning-places/academic-path-switcher-student.png" />
  <div className="academic-path-switcher-copy">
    <p className="eyebrow">Choose a different level</p>
    <h2 id="learning-path-switcher-title">Find the right ICT learning path</h2>
    <p>Choose the level that matches your school grade.</p>
  </div>
  <nav aria-label="Choose a different ICT learning path" className="academic-path-switcher-links">
    {Object.entries(learningPathLabels).filter(([area]) => area !== currentArea).map(([area, label]) => <Link key={area} to={AREAS[area].path}><span><strong>{label.title}</strong><small>{label.detail}</small></span><b aria-hidden="true">→</b></Link>)}
  </nav>
</section>;

const CourseCards = ({ area, courses, loading, error }) => {
  if (loading) return <LoadingSkeleton label="Loading published courses" />;
  if (error) return <InlineError error={error} />;
  const gridColumns = courses.length > 2 ? 3 : 2;
  return courses.length ? <div className={`catalogue-course-grid catalogue-course-grid-${gridColumns} landing-course-grid`}>{courses.map((course) => <CatalogueCourseCard area={area} course={course} key={course.id} />)}</div> : <EmptyState title="Courses will appear here as they are published"><p>Check back soon for the latest lessons.</p></EmptyState>;
};


const AreaSupport = ({ area }) => {
  if (area === 'SCHOOL') return <section className="home-section grade-roadmap"><p className="eyebrow">Choose your grade</p><h2>Start with the grade you are in now</h2><div>{[['6', 'Start your ICT journey with basic computer concepts, safe technology use, and essential digital skills.'], ['7', 'Continue building practical knowledge and learn how digital systems are used in everyday life.'], ['8', 'Strengthen your understanding through structured concepts, activities, and practical applications.'], ['9', 'Prepare for upper-school ICT with stronger digital, logical, and problem-solving skills.']].map(([grade, copy]) => <Link key={grade} to={`/school-ict?grade=${grade}#course-selection`}><span>Grade {grade}</span><p>{copy}</p><b>View Grade {grade} →</b></Link>)}</div></section>;
  if (area === 'OL') return <section className="home-section checklist-section"><p className="eyebrow">Complete O/L ICT Preparation in One Place</p><h2>A clear path for Grades 10 and 11</h2><ul>{['Grade 10 and Grade 11 syllabus coverage', 'Sinhala Medium and English Medium learning paths', 'Structured video explanations', 'Notes and lesson materials', 'Practical ICT guidance', 'Revision and examination-focused content', 'Student progress tracking'].map((item) => <li key={item}>{item}</li>)}</ul></section>;
  return <section className="home-section competency-section"><p className="eyebrow">A clear path through the complete A/L ICT syllabus</p><h2>Every competency in official syllabus order</h2><p>Published competency cards show the available medium, chapters, free content, your progress after sign-in, and the next suitable action: Start, Continue, Review, or Unlock.</p></section>;
};

const AcademicLandingPage = ({ area }) => {
  const info = AREAS[area];
  const catalogue = useQuery({ queryKey: queryKeys.content.publicCourses(), queryFn: ({ signal }) => contentApi.publicCourses({}, signal), staleTime: 60_000, retry: 1 });
  const courses = (catalogue.data?.data || []).filter((course) => academicAreaForCourse(course) === area);
  usePageSeo({ path: info.path, image: info.image, structuredData: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: info.title } });
  return <><Hero area={area} />
    <section className="home-section course-picker" id="course-selection"><p className="eyebrow">Available courses</p><h2>{area === 'SCHOOL' ? 'ICT courses for Grades 6–9' : info.action}</h2><CourseCards area={area} courses={courses} error={catalogue.error} loading={catalogue.isPending} /></section>
    <LearningPathSwitcher currentArea={area} />
  </>;
};

export const AlIctPage = () => <AcademicLandingPage area="AL" />;
export const OlIctPage = () => <AcademicLandingPage area="OL" />;
export const SchoolIctPage = () => <AcademicLandingPage area="SCHOOL" />;
