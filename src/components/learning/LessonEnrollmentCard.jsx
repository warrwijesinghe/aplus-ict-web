import { Link } from 'react-router-dom';
import { LessonProgress } from './LessonProgress.jsx';

export const LessonEnrollmentCard = ({ enrollment }) => {
  const path = `/courses/${enrollment.courseSlug}/lessons/${enrollment.lessonSlug}`;
  const fullAccess = enrollment.fullAccess === true;
  const expired = enrollment.purchasedAccessExpired === true;
  const completed = fullAccess && enrollment.progress?.isCompleted === true;
  const previewCompleted = !fullAccess && enrollment.progress?.freePreviewCompleted === true;
  const action = expired ? 'Renew access' : fullAccess ? completed ? 'Study again' : 'Continue' : previewCompleted ? 'Unlock Full Lesson' : 'Continue learning';
  const destination = expired || previewCompleted ? `${path}/exam-success-pack` : completed ? `${path}/learn` : enrollment.continueTo || `${path}/learn`;
  return <article className="learning-course-card lesson-enrollment-card minimal-lesson-card">
    <header><p>{enrollment.courseTitle}<span>{enrollment.medium}</span></p>{fullAccess && <span className="lesson-access-badge is-full">Full access</span>}{!enrollment.canLearn && <span className="lesson-access-badge">Unavailable</span>}</header>
    <h3 lang={/sinhala|සිංහල/i.test(enrollment.medium || '') ? 'si' : undefined}>{enrollment.lessonNumber ? `Lesson ${String(enrollment.lessonNumber).padStart(2, '0')} · ` : ''}{enrollment.lessonTitle}</h3>
    {enrollment.canLearn ? <>
      {enrollment.progressError ? <p className="lesson-progress-note">Progress unavailable. <button type="button" onClick={() => enrollment.retryProgress?.()}>Retry</button></p> : <LessonProgress progress={enrollment.progress} completed={completed} label={`${enrollment.lessonTitle} progress`} />}
      {previewCompleted && <p className="lesson-progress-note free-preview-completed">✓ Free preview completed</p>}
      {enrollment.accessUntil && (fullAccess || expired) && <p className={expired ? 'lesson-access-until lesson-expiry-warning' : 'lesson-access-until'}>Access {expired ? 'expired' : 'until'} {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Colombo' }).format(new Date(enrollment.accessUntil))}</p>}
      <div className="lesson-card-actions">
        <Link className="button" to={destination}>{action}</Link>
        {!fullAccess && !expired && !previewCompleted && <Link className="button secondary" to={`${path}/exam-success-pack`}>Unlock Full Lesson</Link>}
      </div>
    </> : <><p className="lesson-progress-note">This lesson is currently unavailable.</p><Link className="button secondary" to={path}>View access details</Link></>}
  </article>;
};
