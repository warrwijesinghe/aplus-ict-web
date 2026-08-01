import { useQueries, useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { contentApi } from '../api/content.api.js';
import { queryKeys } from '../api/query-keys.js';
import { CatalogueCourseCard } from '../components/catalogue/CatalogueUi.jsx';
import { EmptyState, InlineError, LoadingSkeleton } from '../components/common/States.jsx';
import { usePageSeo } from '../seo/use-page-seo.js';

const areas = {
  AL: { path: '/al-ict', label: 'A/L ICT', grades: 'Grades 12–13', description: 'Examination-focused structured learning for A/L ICT.', heading: 'A/L ICT learning for confident exam preparation', journey: ['Explore your medium', 'Follow 13 syllabus competencies', 'Practise with structured lesson content'] },
  OL: { path: '/ol-ict', label: 'O/L ICT', grades: 'Grades 10–11', description: 'A connected two-year ICT learning journey.', heading: 'Build from Grade 10 foundations to Grade 11 confidence', journey: ['Start with Grade 10 foundations', 'Progress to Grade 11 applications', 'Prepare with a connected learning path'] },
  SCHOOL: { path: '/school-ict', label: 'Grade 6–9 ICT', grades: 'Grades 6–9', description: 'Practical, age-appropriate foundations for young ICT learners.', heading: 'Explore practical ICT skills from Grade 6 to Grade 9', journey: ['Choose your grade', 'Build practical computer skills', 'Grow confidently into the next grade'] }
};

const coursesFor = (area) => ({ signal }) => contentApi.publicCourses({ academicLevel: area }, signal);
const activeCourse = (courses, medium) => courses.find((course) => course.medium?.code === medium && course.availabilityStatus === 'active') || courses.find((course) => course.medium?.code === medium);

const PathwayCard = ({ area, courses }) => {
  const info = areas[area];
  const lessonCount = courses.reduce((total, course) => total + Number(course.syllabusLessonCount || 0), 0);
  return <article className={'platform-pathway pathway-' + area.toLowerCase()}>
    <div className="pathway-visual" aria-hidden="true"><span>{area === 'AL' ? 'A/L' : area === 'OL' ? '10–11' : '6–9'}</span><i /></div>
    <p className="eyebrow">{info.grades}</p><h2>{info.label}</h2><p>{info.description}</p>
    <div className="pathway-card-footer"><p className="course-facts">{courses.length ? `${courses.length} courses · ${lessonCount || 'Syllabus'} lessons` : 'Pathway being prepared'}</p><Link className="text-link" to={info.path}>Explore pathway <span aria-hidden="true">→</span><span className="sr-only">: {info.label}</span></Link></div>
  </article>;
};

const FreeLessons = ({ courses }) => {
  const active = courses.filter((course) => Number(course.freeContentCount) > 0).slice(0, 6);
  const queries = useQueries({ queries: active.map((course) => ({ queryKey: queryKeys.content.publicCurriculum(course.slug), queryFn: ({ signal }) => contentApi.publicCurriculum(course.slug, signal), staleTime: 60_000 })) });
  if (!active.length) return <EmptyState title="Free lessons are being prepared" />;
  if (queries.some((query) => query.isLoading)) return <LoadingSkeleton label="Loading free lessons" />;
  if (queries.some((query) => query.isError)) return <InlineError error={queries.find((query) => query.isError)?.error} />;
  const lessons = queries.flatMap((query) => {
    const course = query.data?.data;
    return (course?.lessons || []).filter((lesson) => lesson.freeContentCount > 0).map((lesson) => ({ course, lesson }));
  }).slice(0, 6);
  return lessons.length ? <div className="free-lesson-grid">{lessons.map(({ course, lesson }) => <article key={lesson.id}>
    <p className="eyebrow">{course.courseGroup || course.academicLevel?.nameEn} · {course.academicLevel?.nameEn} · {course.medium?.nameEn || course.medium?.name}</p>
    <h3>{lesson.title}</h3><p>{lesson.freeContentCount} free learning item{lesson.freeContentCount === 1 ? '' : 's'} available</p>
    <Link className="text-link" to={`/courses/${course.slug}/lessons/${lesson.slug}`}>Open free lesson <span aria-hidden="true">→</span></Link>
  </article>)}</div> : <EmptyState title="Free lessons are being prepared" />;
};

export const PlatformHomePage = () => {
  const catalogue = useQuery({ queryKey: queryKeys.content.publicCourses(), queryFn: ({ signal }) => contentApi.publicCourses({}, signal), staleTime: 60_000 });
  const courses = catalogue.data?.data || [];
  const siteUrl = (import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, '');
  usePageSeo({ title: 'ICT Courses from Grade 6 to A/L', description: 'Sinhala and English-medium ICT learning paths for Grade 6 to A/L students in Sri Lanka.', path: '/', imageAlt: 'Students learning ICT with A Plus ICT', structuredData: { '@context': 'https://schema.org', '@graph': [{ '@type': 'EducationalOrganization', name: 'A Plus ICT', url: siteUrl }, { '@type': 'WebSite', name: 'A Plus ICT', url: siteUrl }] } });
  return <>
    <section className="hero platform-hero"><img alt="Sri Lankan students collaborating in an ICT lesson" className="hero-image" fetchPriority="high" height="900" loading="eager" src="/images/platform-learning-journey.webp" width="1600" /><div className="hero-copy"><p className="eyebrow">A Plus ICT Learning Platform · <span lang="si">ICT ඉගෙනුම් වේදිකාව</span></p><h1>ICT learning that grows with every stage</h1><p lang="si">6 ශ්‍රේණියේ සිට උසස් පෙළ දක්වා ඔබට ගැළපෙන ICT ඉගෙනුම් මාර්ගය තෝරන්න.</p><p>Choose your stage first. Then find the right grade, medium and structured learning path.</p><p className="hero-actions"><Link className="button" to="#pathways">Find your learning path <span aria-hidden="true">↓</span></Link><Link className="button secondary" to="/resources">Explore free resources</Link></p><div className="hero-stage-strip" aria-label="Academic pathways"><span>Grade 6–9</span><span>O/L · 10–11</span><span>A/L · 12–13</span></div></div></section>
    <section className="home-section" id="pathways"><p className="eyebrow">Choose your pathway</p><h2>Start with the right academic stage</h2><p className="section-intro">Each pathway uses the same A Plus ICT learning platform, with its own grade and medium choices.</p>{catalogue.isLoading ? <LoadingSkeleton label="Loading pathways" /> : null}{catalogue.isError ? <InlineError error={catalogue.error} /> : null}{!catalogue.isLoading && !catalogue.isError ? <div className="platform-pathway-grid">{Object.keys(areas).map((area) => <PathwayCard area={area} courses={courses.filter((course) => course.courseGroup === area)} key={area} />)}</div> : null}</section>
    <section className="home-section"><p className="eyebrow">Why A Plus ICT</p><h2>One learning path, built around your stage</h2><div className="steps-grid">{['Sinhala and English-medium learning', 'Structured lessons, videos, notes, activities and quizzes', 'Free and unlocked content in one path', 'Google sign-in and learning progress'].map((benefit, index) => <article key={benefit}><span>0{index + 1}</span><h3>{benefit}</h3></article>)}</div></section>
    <section className="home-section"><p className="eyebrow">How it works</p><h2>Four simple steps</h2><div className="steps-grid">{['Select the academic stage', 'Select grade and medium', 'Sign in with Google', 'Learn and track progress'].map((step, index) => <article key={step}><span>0{index + 1}</span><h3>{step}</h3></article>)}</div></section>
    <section className="home-section"><p className="eyebrow">Available now</p><h2>Featured free learning</h2><FreeLessons courses={courses} /></section>
    <section className="home-section tutor-preview"><div className="tutor-image-frame"><img alt="WARR Wijesinghe" className="tutor-image" height="720" loading="lazy" src="/images/aplus-ict-tutor.png" width="720" /></div><div><p className="eyebrow">Your tutor</p><h2>WARR Wijesinghe</h2><p>ICT Educator · Software Engineer</p><p>Clear foundations and consistent practice help learners grow with confidence at every stage.</p><Link className="text-link" to="/about">Meet the tutor <span aria-hidden="true">→</span></Link></div></section>
    <section className="final-home-cta"><div><p className="eyebrow">A Plus ICT</p><h2>Choose the right ICT learning path today</h2></div><div className="hero-actions">{Object.values(areas).map((area) => <Link className="button secondary" key={area.path} to={area.path}>{area.label}</Link>)}</div></section>
  </>;
};

export const AcademicAreaPage = ({ area }) => {
  const info = areas[area]; const catalogue = useQuery({ queryKey: queryKeys.content.publicCourses({ academicLevel: area }), queryFn: coursesFor(area), staleTime: 60_000 }); const courses = catalogue.data?.data || [];
  usePageSeo({ title: `${info.label} Courses in Sri Lanka`, description: `${info.description} Choose a grade and Sinhala or English medium with A Plus ICT.`, path: info.path });
  const grades = [...new Map(courses.map((course) => [course.academicLevel?.code, course.academicLevel])).values()].filter(Boolean);
  return <><section className="area-hero"><p className="eyebrow">{info.grades} · Sinhala & English Medium</p><h1>{info.heading}</h1><p>{info.description} Choose the right grade and medium; individual courses always open through their dynamic course page.</p><div className="medium-actions">{['sinhala', 'english'].map((medium) => { const course = activeCourse(courses, medium); return <Link className="button" key={medium} to={course ? `/courses/${course.slug}` : '/courses'}>{medium === 'sinhala' ? 'Sinhala Medium' : 'English Medium'}</Link>; })}</div></section><section className="home-section"><p className="eyebrow">Learning journey</p><div className="steps-grid">{info.journey.map((item, index) => <article key={item}><span>0{index + 1}</span><h2>{item}</h2></article>)}</div></section><section className="home-section"><p className="eyebrow">Courses by grade</p><h2>Select your grade and medium</h2>{catalogue.isLoading ? <LoadingSkeleton label="Loading courses" /> : null}{catalogue.isError ? <InlineError error={catalogue.error} /> : null}{!catalogue.isLoading && !catalogue.isError && !courses.length ? <EmptyState title="Courses are being prepared" /> : null}{grades.map((grade) => <section className="course-level-group" key={grade.code}><h3>{grade.nameEn}</h3><div className="catalogue-course-grid">{courses.filter((course) => course.academicLevel?.code === grade.code).map((course) => <CatalogueCourseCard course={course} key={course.id} />)}</div></section>)}</section><section className="home-section"><p className="eyebrow">Learning access</p><h2>Videos, notes, activities, quizzes and progress</h2><p>Availability is shown per course and lesson. A syllabus can be visible while learning content is still being prepared.</p></section><section className="final-home-cta"><div><p className="eyebrow">A Plus ICT</p><h2>Find your ICT course</h2></div><Link className="button" to="/courses">View complete course catalogue</Link></section></>;
};

export const AlIctPage = () => <AcademicAreaPage area="AL" />;
export const OlIctPage = () => <AcademicAreaPage area="OL" />;
export const SchoolIctPage = () => <AcademicAreaPage area="SCHOOL" />;
