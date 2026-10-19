export const LessonProgress = ({ progress, label = 'Lesson progress', completed = progress?.isCompleted === true }) => {
  const value = progress?.progressPercent ?? progress?.percentage;
  if (!Number.isFinite(value)) return <p className="lesson-progress-note">Progress not available yet</p>;
  const percentage = Math.min(100, Math.max(0, value));
  return <div className="minimal-lesson-progress"><progress aria-label={label} max="100" value={percentage} /><span>{completed ? '✓ 100% complete' : percentage === 100 ? '100% of required activities' : `${percentage}% complete`}</span></div>;
};
