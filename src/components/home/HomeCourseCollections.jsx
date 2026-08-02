import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { contentApi } from '../../api/content.api.js';
import { queryKeys } from '../../api/query-keys.js';
import { CatalogueCourseCard } from '../catalogue/CatalogueUi.jsx';
import { InlineError, LoadingSkeleton } from '../common/States.jsx';
import { LearningFreedomSection } from './LearningFreedomSections.jsx';
import { academicAreaForCourse } from '../../utils/academic-course.js';

const collections = [
  {
    area: 'AL',
    eyebrow: 'Grades 12–13',
    path: '/al-ict',
    title: 'A/L ICT Courses',
    titleSi: 'උසස් පෙළ',
    description: 'Explore the currently published A/L ICT learning paths.'
  },
  {
    area: 'OL',
    eyebrow: 'Grades 10–11',
    path: '/ol-ict',
    title: 'O/L ICT Courses',
    titleSi: 'සාමාන්‍ය පෙළ',
    description: 'Explore the currently published O/L ICT learning paths.'
  },
  {
    area: 'SCHOOL',
    eyebrow: 'Grades 6–9',
    path: '/school-ict',
    title: 'Grades 6–9 ICT Courses',
    titleSi: '6 -9 ශ්‍රේණි',
    description: 'Explore the currently published school ICT learning paths.'
  }
];

const byCatalogueOrder = (first, second) => Number(first.sortOrder || 0) - Number(second.sortOrder || 0);

const CourseCollection = ({ collection, courses }) => {
  const rowRef = useRef(null);
  const scrollCourses = (direction) => rowRef.current?.scrollBy({ behavior: 'smooth', left: direction * rowRef.current.clientWidth * 0.84 });

  return <section className={`home-course-collection home-course-collection-${collection.area.toLowerCase()}`} id={collection.area === 'AL' ? 'pathways' : undefined}>
    <div className="home-course-collection-heading">
      <p className="eyebrow">{collection.eyebrow}</p>
      <h2>{collection.title}</h2>
      <p className="home-course-collection-sinhala" lang="si">{collection.titleSi}</p>
      <p>{collection.description}</p>
    </div>
    {courses.length ? <>
      <div className={`catalogue-course-grid home-course-grid home-course-grid-${courses.length > 2 ? 3 : 2}`} ref={rowRef}>
        {courses.map((course) => <CatalogueCourseCard area={collection.area} course={course} key={course.id} />)}
      </div>
      <div className="home-course-collection-actions">
        <Link aria-label={`View all ${collection.title}`} className="home-course-view-all" to={collection.path}>View All Courses <span aria-hidden="true">→</span></Link>
        <div className="home-course-carousel-controls" aria-label={`${collection.title} carousel controls`}>
          <button aria-label={`Show previous ${collection.title}`} onClick={() => scrollCourses(-1)} type="button">←</button>
          <button aria-label={`Show next ${collection.title}`} onClick={() => scrollCourses(1)} type="button">→</button>
        </div>
      </div>
    </> : <p className="home-course-collection-empty">Courses will appear here when they are published.</p>}
  </section>;
};

export const HomeCourseCollections = () => {
  const catalogue = useQuery({
    queryKey: queryKeys.content.publicCourses(),
    queryFn: ({ signal }) => contentApi.publicCourses({}, signal),
    retry: 1,
    staleTime: 60_000
  });

  if (catalogue.isPending) return <section className="home-course-loading"><LoadingSkeleton label="Loading published courses" /></section>;
  if (catalogue.isError) return <section className="home-course-loading"><InlineError error={catalogue.error} /></section>;

  const courses = [...(catalogue.data?.data || [])].sort(byCatalogueOrder);

  return collections.map((collection, index) => {
    const areaCourses = courses.filter((course) => academicAreaForCourse(course) === collection.area);
    const freedomSection = ['study-anywhere', 'study-any-device', 'study-own-pace'][index];
    return <div className="home-course-collection-group" key={collection.area}>
      <CourseCollection collection={collection} courses={areaCourses} />
      <LearningFreedomSection sectionId={freedomSection} />
    </div>;
  });
};
