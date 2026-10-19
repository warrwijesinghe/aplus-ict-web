import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Check, ShoppingCart } from 'lucide-react';

export const LessonHero = ({ model }) => <section className="lesson-intro-hero" aria-labelledby="lesson-landing-title">
  <div className="lesson-intro-hero-inner">
    <div className="lesson-course-identity"><Link to={`/courses/${model.course.slug || model.courseSlug}`}>{model.courseTitle}</Link><span className="lesson-course-medium">{model.mediumLabel}</span></div>
    <div className="lesson-landing-decision">
    <div className="lesson-intro-hero-copy">
      {model.lesson.lessonNumber != null && <p className="lesson-number-label">{model.t("Lesson", "පාඩම")} {String(model.lesson.lessonNumber).padStart(2, '0')}</p>}
      <h1 id="lesson-landing-title">{model.lesson.title}</h1>
      <p className="lesson-site-hero-description">{model.content.heroDescription || model.t('Explore this ICT lesson at your own pace. Enrol for the free area, or buy the full lesson to continue learning.', 'මෙම තොරතුරු තාක්ෂණ පාඩම ඔබට පහසු වේලාවක ඉගෙන ගන්න. නොමිලේ කොටස සඳහා ලියාපදිංචි වන්න, නැතිනම් සම්පූර්ණ පාඩම මිලදී ගන්න.')}</p>
      {model.content.syllabus?.length > 0 && <div className="lesson-hero-topics">
        <p>{model.t('In this lesson', 'මෙම පාඩමෙන්')}</p>
        <ul>{model.content.syllabus.slice(0, 3).map((item, index) => <li key={index}><Check size={16} aria-hidden="true" />{item.title}</li>)}</ul>
        <a href="#sales-outline-title">{model.t('Explore the lesson outline', 'පාඩමේ අන්තර්ගතය බලන්න')}<ArrowRight size={15} aria-hidden="true" /></a>
      </div>}
    </div>
    <aside className="lesson-access-panel" aria-label={model.t('Choose your lesson access', 'පාඩමට පිවිසෙන ආකාරය තෝරන්න')}>
      {model.comingSoon ? <p className="sales-unavailable" role="status">{model.t('This lesson is coming soon.')}</p> : <>
        <div className="lesson-access-option">
          <div className="lesson-access-heading"><BookOpen size={20} aria-hidden="true" /><h2>{model.unlocked ? model.t('Lesson unlocked') : model.t('Start with the free area', 'නොමිලේ කොටසෙන් අරඹන්න')}</h2></div>
          <p>{model.unlocked ? model.t('Your full lesson is ready. Continue where you left off.', 'ඔබේ සම්පූර්ණ පාඩම සූදානම්. ඉගෙනීම දිගටම කරගෙන යන්න.') : model.t('Enrol for free to access the free part of this lesson. No purchase needed.', 'පාඩමේ නොමිලේ කොටසට පිවිසීමට නොමිලේ ලියාපදිංචි වන්න. මිලදී ගැනීමක් අවශ්‍ය නැත.')}</p>
          <Link className="sales-button sales-button-primary" to={model.freeTo}>{model.freeLabel}<ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
        {!model.unlocked && <div className="lesson-access-option lesson-access-paid">
          <div className="lesson-access-heading"><ShoppingCart size={20} aria-hidden="true" /><h2>{model.t('Get the full lesson', 'සම්පූර්ණ පාඩම ලබා ගන්න')}</h2></div>
          <div className="lesson-site-hero-price"><strong>{model.price || model.t('Price to be announced')}</strong></div>
          <p>{model.t('Full lesson + printed tutorial')}</p>
          {model.canBuy && <Link className="sales-button sales-button-outline" to={model.buyTo}>{model.t('Buy Full Lesson')}<ArrowRight size={18} aria-hidden="true" /></Link>}
        </div>}
      </>}
    </aside>
    </div>
  </div>
</section>;
