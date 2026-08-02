import { Link } from 'react-router-dom';

export const EducatorSection = () => (
  <section aria-labelledby="educator-title" className="home-tutor-section">
    <div className="home-tutor-media"><div className="home-tutor-image-frame"><img alt="WARR Wijesinghe, ICT Educator and Founder of A Plus ICT" className="home-tutor-image" height="760" loading="lazy" sizes="(min-width: 768px) 40vw, 280px" src="/images/aplus-ict-tutor.png" width="620" /></div></div>
    <div className="home-tutor-content">
      <p className="eyebrow">Meet Your ICT Educator</p>
      <h2 id="educator-title">ICT Learning Designed by an Educator and Software Engineer</h2>
      <p className="home-tutor-sinhala" lang="si">සංකීර්ණ ICT සංකල්ප සරලව, ක්‍රමානුකූලව ඉගෙන ගන්න.</p>
      <div className="home-tutor-identity"><h3>WARR Wijesinghe</h3><p>ICT Educator · Software Engineer · Founder, A Plus ICT</p></div>
      <p className="home-tutor-intro">A Plus ICT combines classroom experience with software engineering to make the Sri Lankan school ICT syllabus easier to understand, practise and continue from anywhere.</p>
      <ul className="home-tutor-benefits"><li>Grade 6 to A/L learning pathways</li><li>Sinhala and English Medium support</li><li>Lessons organised around the school ICT syllabus</li></ul>
      <p className="home-tutor-qualification"><strong>Qualifications</strong> B.Sc. Business Administration (Information Systems Special), USJP · Postgraduate Diploma, British Computer Society · CCNA · HDIT (UCSC)</p>
      <Link className="home-tutor-action" to="/about">Learn About A Plus ICT <span aria-hidden="true">→</span></Link>
    </div>
  </section>
);
