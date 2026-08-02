import { Link } from 'react-router-dom';
import { trackPublicEvent } from '../../analytics/events.js';

const sections = [
  {
    id: 'study-anywhere',
    eyebrow: 'Learn From Anywhere',
    title: 'Study Anytime, From Your Own Place',
    sinhalaSupport: 'ඔබට පහසු තැනකින්, පහසු වේලාවකින් ඉගෙන ගන්න.',
    description: 'Your ICT classroom is wherever you are. Learn from home, school, the library or anywhere with internet access—without travelling to a fixed classroom or following a fixed timetable.',
    points: ['Learn from home or anywhere', 'No travelling to attend lessons', 'Continue whenever you have time'],
    images: [
      { src: '/images/learning-places/home-student.webp', alt: 'School student learning ICT from a home study space' },
      { src: '/images/learning-places/quiet-study.webp', alt: 'Student studying ICT in a quiet learning space' },
      { src: '/images/learning-places/outdoor-study.webp', alt: 'Student studying ICT outdoors with a device' }
    ],
  },
  {
    id: 'study-any-device',
    eyebrow: 'Your Device, Your Classroom',
    title: 'Study on the Device You Already Use',
    sinhalaSupport: 'Phone, tablet හෝ computer එකෙන් පහසුවෙන් ඉගෙන ගන්න.',
    description: 'Use your mobile phone, tablet, laptop or desktop computer. A Plus ICT keeps lessons, learning materials and activities organised across different screen sizes.',
    points: ['Mobile, tablet and computer support', 'No special software required', 'Continue learning across your devices'],
    images: [
      { src: '/images/learning-places/school-desk.webp', alt: 'School student learning ICT on a desktop computer' },
      { src: '/images/learning-places/lesson-tablet-headphones.webp', alt: 'Student using a tablet and headphones for an ICT lesson' },
      { src: '/images/learning-places/home-learning.webp', alt: 'Student using a laptop to learn from home' }
    ],
  },
  {
    id: 'study-own-pace',
    eyebrow: 'Learn at Your Pace',
    title: 'Learn at Your Own Speed, in Your Own Way',
    sinhalaSupport: 'ඔබේ වේගයට ඉගෙනගෙන, අවශ්‍ය කොටස් නැවත බලන්න.',
    description: 'Pause a lesson, replay a difficult explanation, take notes and continue when you are ready. Your learning progress helps you return to the correct lesson without starting again.',
    points: ['Pause and replay explanations', 'Repeat difficult lesson sections', 'Continue from where you stopped'],
    images: [
      { src: '/images/learning-places/lesson-study-notes.webp', alt: 'Student taking handwritten notes during an online ICT lesson' },
      { src: '/images/learning-places/lesson-headset-laptop.webp', alt: 'Student learning independently with headphones and a laptop' },
      { src: '/images/learning-places/focused-student.webp', alt: 'Student concentrating on an ICT lesson' }
    ],
  }
];

const coursePathways = [
  { label: 'A/L ICT', route: '/al-ict' },
  { label: 'O/L ICT', route: '/ol-ict' },
  { label: 'Grades 6–9 ICT', route: '/school-ict' }
];

const LearningFreedomSectionContent = ({ section }) => {
  const content = <div className="learning-freedom-content">
    <p className="eyebrow">{section.eyebrow}</p>
    <h2 id={`${section.id}-title`}>{section.title}</h2>
    <p className="learning-freedom-sinhala" lang="si">{section.sinhalaSupport}</p>
    <p className="learning-freedom-description">{section.description}</p>
    <ul className="learning-freedom-points">
      {section.points.map((point) => <li key={point}><span aria-hidden="true">✓</span>{point}</li>)}
    </ul>
    <nav aria-label="Explore ICT course levels" className="learning-freedom-course-links">
      {coursePathways.map((pathway) => <Link key={pathway.route} onClick={() => trackPublicEvent('learning_freedom_course_path_clicked', { destination: pathway.route, section: section.id })} to={pathway.route}>{pathway.label}</Link>)}
    </nav>
  </div>;
  const collage = <div aria-label={`${section.title} student learning images`} className="learning-freedom-collage" role="group">
    {section.images.map((image, index) => <img alt={image.alt} className={`learning-freedom-image learning-freedom-image-${index === 0 ? 'main' : index === 1 ? 'top' : 'bottom'}`} height="640" key={image.src} loading="lazy" sizes="(min-width: 900px) 25vw, 80vw" src={image.src} width="800" />)}
  </div>;

  return <section aria-labelledby={`${section.id}-title`} className={`learning-freedom-section ${section.id === 'study-any-device' ? 'learning-freedom-section-reverse' : ''}`} id={section.id}>
    <div className="learning-freedom-section-inner">{content}{collage}</div>
  </section>;
};

export const LearningFreedomSection = ({ sectionId }) => {
  const section = sections.find((item) => item.id === sectionId);

  if (!section) return null;

  return <LearningFreedomSectionContent section={section} />;
};
