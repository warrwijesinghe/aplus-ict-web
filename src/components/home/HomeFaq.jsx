const questions = [
  ['Who can learn with A Plus ICT?', 'A Plus ICT provides online ICT learning for students from Grade 6 through Grade 13, including School ICT, O/L ICT and A/L ICT.'],
  ['Can I study using a mobile phone?', 'Yes. The platform is designed to work on phones, tablets, laptops and desktop computers.'],
  ['Are Sinhala and English Medium lessons available?', 'Learning paths are organised separately for Sinhala Medium and English Medium students where content is available.'],
  ['Can I start with free lessons?', 'Available free lesson content is clearly shown before a student unlocks paid lesson content.']
];

export const HomeFaq = () => (
  <section className="home-section faq-section">
    <p className="eyebrow">Frequently Asked Questions</p>
    <h2>Before You Begin</h2>
    <div className="faq-list">{questions.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
  </section>
);
