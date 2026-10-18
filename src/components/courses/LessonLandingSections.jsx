import { createElement } from 'react';
import { BookOpen, ChevronDown, Clock3, FileQuestion, FileText, Gift, Layers3, Play, Smartphone, Target, Trophy, Users, Gem } from 'lucide-react';
import { ResourceImage } from '../resources/ResourceImage.jsx';
import { LessonActions } from './LessonActions.jsx';


const Icon = ({ icon, size = 30 }) => createElement(icon, { size, 'aria-hidden': true, strokeWidth: 1.8 });
export const LessonValueFeatures = ({ model }) => <section className="sales-value-grid" id="lesson-benefits" aria-label={model.t("Your lesson benefits")}>{[
  [Target, model.examCourse ? model.t('Exam-Oriented Lesson') : model.t('Focused ICT Lesson'), model.examCourse ? model.t(`Designed around the ${model.areaLabel} syllabus and examination.`, "අදාළ විෂය නිර්දේශයට සහ විභාගයට ගැළපෙන ලෙස සකස් කළ පාඩම්.") : model.t('Build your understanding through a structured ICT lesson.')],
  [BookOpen, model.t('Printed Tutorial – Home Delivery'), model.t('Receive the printed lesson tutorial at your home.')],
  [FileQuestion, model.t('Practice Quizzes'), model.t('Test your understanding with lesson-based questions.')],
  [FileText, model.t('Past Paper Discussions'), model.t('Learn how past-paper questions are answered step by step.')]
].map(([icon, title, text]) => <article key={title}><Icon icon={icon} size={38} /><h2>{title}</h2><p>{text}</p></article>)}</section>;

export const TutorialHighlight = ({ model }) => <section className="sales-tutorial-simple" aria-labelledby="sales-tutorial-title">
  <div><h2 id="sales-tutorial-title">{model.content.tutorialTitle || model.t('Printed Tutorial Included')}</h2><p className="sales-tutorial-delivery">{model.t("Delivered to your home.")}</p></div>
  {model.lesson.tutorialImageResourceId
    ? <ResourceImage className="sales-tutorial-placeholder" resourceId={model.lesson.tutorialImageResourceId} alt={`${model.lesson.title} — ${model.t("Printed tutorial", "මුද්‍රිත නිබන්ධනය")}`} />
    : <img className="sales-tutorial-placeholder" src="/images/tutorial-covers/printed-tutorial-placeholder.png" alt={model.t("A Plus ICT printed tutorial — placeholder book illustration", "A Plus ICT මුද්‍රිත නිබන්ධනයේ ආදර්ශ රූපයක්")} width="1536" height="1024" loading="lazy" />}
</section>;
export const LmsFeatures = ({ model }) => <section className="sales-section" id="lesson-lms" aria-labelledby="sales-lms-title"><div className="sales-section-heading"><div><h2 id="sales-lms-title">{model.t("What you get in the LMS")}</h2><p className="sales-section-intro">{model.t("A complete online learning experience with tools to support your learning.")}</p></div><span className="sales-handwritten">{model.t("Study anytime.", "ඔබට පහසු වේලාවක.")}<br />{model.t("Anywhere.", "ඕනෑම තැනක සිට.")}</span></div><div className="sales-lms-grid">{[
  [Play, model.examCourse ? model.t('Full Exam-Oriented Video Lesson') : model.t('Full Video Lesson'), model.t(`Clear ${model.mediumLabel.replace(' Medium', '')} explanations with a focused approach.`, "පාඩම හොඳින් තේරුම් ගැනීමට පැහැදිලි සිංහල විස්තර කිරීම්.")],
  [FileQuestion, model.t('Practice Quizzes'), model.t('Lesson-based quizzes to strengthen understanding.')],
  [FileText, model.t('Past Paper Discussions'), model.t('Detailed solutions and exam techniques.')],
  [Layers3, model.t('Lesson-by-Lesson Learning'), model.t('Structured learning that is easy to follow.')],
  [Gift, model.t('Start Free'), model.t('Experience part of the lesson before purchasing.')],
  [Smartphone, model.t('Mobile Friendly'), model.t('Learn using your phone, tablet or computer.')]
].map(([icon, title, text]) => <article key={title}><Icon icon={icon} size={35} /><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></section>;

export const LessonOutline = ({ content, model }) => <section className="sales-section sales-outline" aria-labelledby="sales-outline-title"><h2 id="sales-outline-title">{model.t("What you’ll learn")}</h2>{content.overview && <p className="sales-section-intro sales-preserve-lines">{content.overview}</p>}{content.syllabus?.length > 0 && <ol>{content.syllabus.map((item, index) => <li key={index}>{item.description ? <details><summary><span>{String(index + 1).padStart(2, '0')}</span><strong>{item.title}</strong><ChevronDown aria-hidden="true" size={18} /></summary><p className="sales-preserve-lines">{item.description}</p></details> : <div className="sales-outline-title"><span>{String(index + 1).padStart(2, '0')}</span><strong>{item.title}</strong></div>}</li>)}</ol>}</section>;

export const WhyAPlusICT = ({ model }) => <section className="sales-section sales-why" aria-labelledby="sales-why-title"><h2 id="sales-why-title">{model.t("Why students choose A Plus ICT")}</h2><p className="sales-section-intro">{model.t("A clear way to learn ICT, with support online and on paper.")}</p><div>{[
  [Trophy, model.examCourse ? model.t(`${model.areaLabel} Exam Focus`, "විභාගයට සූදානම් වන්න") : model.t('Focused ICT Learning'), model.examCourse ? model.t('Content designed around examination preparation.') : model.t('Build your skills through structured lessons.')],
  [Users, model.t('Simple Explanations'), model.t('Clear explanations for Sri Lankan students.')],
  [Clock3, model.t('Study at Your Own Pace'), model.t('Study anytime and anywhere.')],
  [Gem, model.t('Tutorial + LMS'), model.t('Online learning combined with printed study material.')]
].map(([icon, title, text]) => <article key={title}><Icon icon={icon} size={32} /><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></section>;

export const LessonFinalCTA = ({ model }) => <section className="sales-final-cta" id="lesson-full-access" aria-labelledby="sales-cta-title"><div><p className="sales-eyebrow">{model.t(`Take the first step towards ${model.examCourse ? "your next exam" : "your next learning goal"}`, "ඔබේ ඉගෙනීමේ ඊළඟ පියවර අදම අරඹන්න")}</p><h2 id="sales-cta-title">{model.content.ctaTitle || model.t('Start free today and continue with the full lesson when you are ready.')}</h2>{model.content.ctaDescription && <p className="sales-preserve-lines">{model.content.ctaDescription}</p>}<LessonActions model={model} light /></div><img src="/images/learning-places/lesson-laptop-focus.webp" alt="" loading="lazy" width="400" height="400" /></section>;
