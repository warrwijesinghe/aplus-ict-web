import { useQuery } from '@tanstack/react-query';
import { BookOpen, GraduationCap, Laptop, Award, School } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { contentApi } from '../api/content.api.js';
import { usePageSeo } from '../seo/use-page-seo.js';

const categories = [
  { id: 'SCHOOL', path: '/school-ict', title: 'Grade 6–9 ICT', detail: 'School ICT', image: 'school-online-learning.webp', icon: <School aria-hidden="true" size={22} /> },
  { id: 'OL', path: '/ol-ict', title: 'O/L ICT', detail: 'Grades 10–11', image: 'ol-online-learning.webp', icon: <BookOpen aria-hidden="true" size={22} /> },
  { id: 'AL', path: '/al-ict', title: 'A/L ICT', detail: 'Grades 12–13', image: 'al-online-learning.webp', icon: <Laptop aria-hidden="true" size={22} /> },
  { id: 'DEGREE', path: '/degree', title: 'Degree', detail: 'Higher education', image: 'campus-steps.webp', icon: <GraduationCap aria-hidden="true" size={22} /> },
  { id: 'PROFESSIONAL', path: '/professional-certifications', title: 'Professional Certifications', detail: 'Professional learning', image: 'lesson-laptop-focus.webp', icon: <Award aria-hidden="true" size={22} /> },
  { id: 'SHORT_COURSES', path: '/short-courses', title: 'Short Courses', detail: 'Practical learning', image: 'practical-learning.webp', icon: <BookOpen aria-hidden="true" size={22} /> }
];
const mediumLabel = (medium) => /\bmedium\b/i.test(medium) ? medium : `${medium} medium`;

export const CourseSelectionPage = ({ student = false }) => {
  const [search] = useSearchParams();
  const selected = categories.find((category) => category.id.toLowerCase() === search.get('category'));
  const basePath = student ? '/student/explore' : '/courses';
  const courses = useQuery({ queryKey: ['course-selection'], queryFn: ({ signal }) => contentApi.courseSelection(signal), retry: false });
  const items = (courses.data?.data || []).filter((course) => course.courseGroup === selected?.id);
  usePageSeo({ path: student ? '/student/explore' : '/courses', title: 'Explore courses', description: 'Explore ICT courses and learning paths at A Plus ICT.', noIndex: student });

  return <section className={`course-selection${student ? ' course-selection-student' : ''}`}>
    <header className="course-selection-heading">
      {selected && <Link className="course-selection-back" to={basePath}>← All categories</Link>}
      <p className="eyebrow">{selected ? selected.detail : 'Explore courses'}</p>
      <h1>{selected ? selected.title : 'Choose your learning path'}</h1>
      <p>{selected ? 'Choose a course below. Courses marked coming soon are not available yet.' : 'Select a category to see its courses.'}</p>
      {student && <Link className="course-selection-dashboard" to="/student">Go to my dashboard <span aria-hidden="true">→</span></Link>}
    </header>
    {courses.isLoading ? <p className="course-selection-message" role="status">Loading courses…</p> : courses.isError ? <div className="course-selection-message" role="alert"><p>Courses could not be loaded. Please try again.</p><button onClick={() => courses.refetch()} type="button">Try again</button></div> :
      selected ? items.length ? <CourseSummaryCards courses={items} /> : <p className="course-selection-message">Courses in this category are coming soon.</p> : <div className="course-selection-grid course-selection-categories">{categories.map(({ id, path, title, detail, icon, image }) => {
        const categoryCourses = (courses.data?.data || []).filter((course) => course.courseGroup === id);
        return <Link className="course-selection-card course-selection-category" key={id} to={path}>
          <img alt="" className="course-selection-category-image" decoding="async" loading="lazy" src={`/images/learning-places/${image}`} />
          <div className="course-selection-category-body"><div className="course-selection-card-heading"><span className="course-selection-icon">{icon}</span><div><p>{detail}</p><h2>{title}</h2></div></div>
          <span className="course-selection-category-action">{categoryCourses.some((course) => course.availabilityStatus === 'active') ? 'View courses' : 'Coming soon'} <span aria-hidden="true">→</span></span></div>
        </Link>;
      })}</div>}
  </section>;
};

export const CourseSummaryCards = ({ courses }) => <div className="course-selection-grid">{courses.map((course) => <article className="course-selection-card course-selection-course" key={course.id}>
  <div><h3>{course.title}</h3>{course.medium && <p>{mediumLabel(course.medium)}</p>}</div>
  {course.availabilityStatus === 'active' ? <Link aria-label={`Explore ${course.title}${course.medium ? `, ${mediumLabel(course.medium)}` : ''}`} to={`/courses/${course.slug}`}>Explore course <span aria-hidden="true">→</span></Link> : <span className="course-selection-soon">Coming soon</span>}
</article>)}</div>;
