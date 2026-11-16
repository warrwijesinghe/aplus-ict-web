import { bilingualLessonPriceLabel, formatLkr, lessonPriceFor, originalLessonPriceFor } from '../../config/lesson-pricing.js';

export const LessonPrice = ({ area, course, product, showLabel = true }) => {
  const amount = lessonPriceFor({ area, course, product });
  const label = bilingualLessonPriceLabel(amount);
  const original = formatLkr(originalLessonPriceFor(product));
  if (!amount) return null;
  return <p className="lesson-price">
    {showLabel ? <><span>{label.english} / <span lang="si">{label.sinhala}</span></span></> : null}
    {original && <del>{original}</del>}
    <strong>{label.value}</strong>
  </p>;
};
