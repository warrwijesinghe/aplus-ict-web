import { PageHero } from '../common/PageHero.jsx';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/auth-context.jsx';

export const HomeHero = () => {
  const { isAuthenticated } = useAuth();

  return (
    <PageHero titleId="home-hero-title" images={[{"src":"/images/learning-places/home-hero-student-focus.jpg","alt":"Student learning ICT with a headset at a desktop computer"},{"src":"/images/learning-places/quiet-study.webp","alt":"Student studying ICT in a quiet learning space"},{"src":"/images/learning-places/outdoor-laptop.webp","alt":"Student studying ICT outdoors with a laptop"},{"src":"/images/learning-places/home-learning.webp","alt":"Student learning comfortably from home with a laptop"},{"src":"/images/learning-places/outdoor-study.webp","alt":"Student studying ICT outdoors"}]}>
        <p className="eyebrow">Sri Lankan School ICT · Grades 6–13</p>
        <h1 id="home-hero-title">Study ICT Anytime. Anywhere.</h1>
        <p className="hero-language-note" lang="si">
          ඔබේ වේලාවට. ඔබේ වේගයට. ඕනෑම තැනකින්.
        </p>
        <p>
          Learn the school ICT syllabus through structured video lessons, learning materials,
          activities and progress tracking—organised by grade and medium.
        </p>
        <div aria-label="Start learning" className="hero-actions">
          {isAuthenticated ? (
            <>
              <Link className="button" to="/al-ict">
                A/L ICT
              </Link>
              <Link className="button" to="/ol-ict">
                O/L ICT
              </Link>
              <Link className="button" to="/school-ict">
                Grades 6–9 ICT
              </Link>
            </>
          ) : (
            <Link className="button" to="/login">
              Start ICT Learning Now Free!
            </Link>
          )}
        </div>
    </PageHero>
  );
};
