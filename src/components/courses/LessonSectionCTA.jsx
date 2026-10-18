import { LessonActions } from './LessonActions.jsx';

export const LessonSectionCTA = ({ model, placement }) => {
  if (model.comingSoon) return null;
  const messages = {
    introduction: model.t('Ready to try this lesson?', 'මෙම පාඩම ඉගෙනීම අරඹන්න සූදානම්ද?'),
    tutorial: model.t('Get the full lesson and your printed tutorial.', 'සම්පූර්ණ පාඩම සහ ඔබේ මුද්‍රිත නිබන්ධනය ලබා ගන්න.'),
    lms: model.t('Take your next step in learning.', 'ඔබේ ඉගෙනීමේ ඊළඟ පියවර අරඹන්න.'),
  };
  return <section className="lesson-section-cta" aria-label={model.t('Lesson enrollment options', 'පාඩමට සම්බන්ධ වීමේ විකල්ප')}>
    <p>{model.unlocked ? model.t('Your lesson is ready. Keep learning.', 'ඔබේ පාඩම සූදානම්. දිගටම ඉගෙන ගන්න.') : messages[placement]}</p>
    <LessonActions model={model} />
  </section>;
};
