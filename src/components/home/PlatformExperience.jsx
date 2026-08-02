const benefits = ['Structured Video Lessons', 'Notes and Learning Materials', 'Activities and Practice', 'Progress and Continue Learning'];

export const PlatformExperience = () => (
  <section className="home-section platform-experience">
    <div className="platform-experience-intro">
      <p className="eyebrow">One Organised Learning Platform</p>
      <h2>Everything Stays in One Lesson Flow</h2>
      <p>Videos, learning materials, activities and progress are organised together so students always know what to learn next.</p>
    </div>
    <div className="platform-experience-content">
      <div aria-hidden="true" className="platform-flow-preview">
        <span className="platform-preview-label">Platform Preview</span>
        <div className="platform-flow-header"><span>A Plus ICT</span><span>ICT Lesson</span></div>
        <div className="platform-flow-video"><span>▶</span><b>Watch the lesson</b></div>
        <div className="platform-flow-items"><span>1 Video lesson</span><span>2 Learning material</span><span>3 Practice activity</span></div>
      </div>
      <ul className="platform-benefits">{benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul>
    </div>
  </section>
);
