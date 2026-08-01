import { bilingualLessonPriceLabel, lessonPriceFor } from '../../config/lesson-pricing.js';

export const LessonPrice = ({ area, course, product, showLabel = true }) => {
  const amount = lessonPriceFor({ area, course, product });
  const label = bilingualLessonPriceLabel(amount);
  if (!amount) return null;
  return <p className="lesson-price">
    {showLabel ? <><span>{label.english} / <span lang="si">{label.sinhala}</span></span></> : null}
    <strong>{label.value}</strong>
  </p>;
};
