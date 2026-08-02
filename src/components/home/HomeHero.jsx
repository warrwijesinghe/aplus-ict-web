import { Link } from 'react-router-dom';

export const HomeHero = () => (
  <section aria-labelledby="home-hero-title" className="public-hero platform-home-hero">
    <div className="public-hero-copy">
      <p className="eyebrow">Sri Lankan School ICT · Grades 6–13</p>
      <h1 id="home-hero-title">Study ICT Anytime. Anywhere.</h1>
      <p className="hero-language-note" lang="si">ඔබේ වේලාවට. ඔබේ වේගයට. ඕනෑම තැනකින්.</p>
      <p>Learn the school ICT syllabus through structured video lessons, learning materials, activities and progress tracking—organised by grade and medium.</p>
      <div className="hero-actions">
        <Link className="button" to="/free-lessons">Start Free ICT Learning Now</Link>
      </div>
    </div>
    <div aria-label="Students learning with laptops and tablets in different settings" className="public-hero-media hero-image-grid" role="group">
      <img alt="Student learning ICT online using a laptop" className="hero-grid-main" fetchPriority="high" height="810" loading="eager" sizes="(min-width: 1024px) 24vw, 58vw" src="/images/learning-places/home-hero-student.webp" width="1440" />
      <img alt="Student studying ICT in a quiet learning space" className="hero-grid-tablet" height="600" loading="lazy" sizes="(min-width: 1024px) 14vw, 32vw" src="/images/learning-places/quiet-study.webp" width="800" />
      <img alt="Student studying ICT outdoors with a laptop" className="hero-grid-outdoor" height="600" loading="lazy" sizes="(min-width: 1024px) 14vw, 32vw" src="/images/learning-places/outdoor-laptop.webp" width="800" />
      <img alt="Student learning comfortably from home with a laptop" className="hero-grid-home" height="600" loading="lazy" sizes="(min-width: 1024px) 14vw, 32vw" src="/images/learning-places/home-learning.webp" width="800" />
      <img alt="Student studying ICT outdoors" className="hero-grid-notes" height="600" loading="lazy" sizes="(min-width: 1024px) 14vw, 32vw" src="/images/learning-places/outdoor-study.webp" width="800" />
      <p className="hero-gallery-caption">Your lesson. Your device. Your place.</p>
    </div>
  </section>
);
