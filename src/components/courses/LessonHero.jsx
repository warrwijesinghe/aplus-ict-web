import { LessonActions } from './LessonActions.jsx';

export const LessonHero = ({ model }) => <section className="lesson-intro-hero" aria-labelledby="lesson-landing-title">
  <div className="lesson-intro-hero-inner">
    <div className="lesson-course-identity"><strong>{model.courseTitle}</strong><span className="lesson-course-medium">{model.mediumLabel}</span></div>
    <div className="lesson-intro-hero-copy">
      <p className="eyebrow">{model.t("Lesson", "පාඩම")} {String(model.lesson.lessonNumber || 1).padStart(2, '0')}</p>
      <h1 id="lesson-landing-title">{model.lesson.title}</h1>
      <p className="lesson-intro-tagline">{model.t("Study anytime, anywhere.")}</p>
      <p className="lesson-site-hero-description">{model.content.heroDescription || model.t('Start learning free. Unlock the full lesson and a printed tutorial delivered to your home when you’re ready.')}</p>
      <div className="lesson-site-hero-price"><strong>{model.unlocked ? model.t('Lesson unlocked') : model.price || model.t('Price to be announced')}</strong><span>{model.t("Full lesson + printed tutorial")}</span></div>
      <LessonActions model={model} />
    </div>
  </div>
</section>;
