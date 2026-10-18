// Temporary public introduction, separate from protected LMS content.
const SAMPLE_VIDEO_ID = '5bDZqG9fSXM';

export const LessonIntroduction = ({ model }) => <section className="lesson-introduction-section" aria-labelledby="lesson-introduction-title">
  <h2 id="lesson-introduction-title">{model.t('Course introduction', 'පාඨමාලා හැඳින්වීම')}</h2>
  <div className="lesson-intro-video-frame">
    <iframe src={`https://www.youtube-nocookie.com/embed/${SAMPLE_VIDEO_ID}?rel=0`} title={`${model.lesson.title} — ${model.t('sample course introduction video', 'පාඨමාලා හැඳින්වීමේ ආදර්ශ වීඩියෝව')}`} loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
  </div>
</section>;
