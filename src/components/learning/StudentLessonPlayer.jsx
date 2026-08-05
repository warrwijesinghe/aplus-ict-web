import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation, useParams } from 'react-router-dom';
import { learningApi } from '../../api/learning.api.js';
import { queryKeys } from '../../api/query-keys.js';
import { resourceApi } from '../../api/resource.api.js';
import { safeExternalUrl } from '../../utils/safe-url.js';
import { useAuth } from '../../auth/auth-context.jsx';
import { serviceUrls } from '../../api/service-urls.js';
import { EmptyState, InlineError, LoadingSkeleton } from '../common/States.jsx';

const typeNames = { label: 'Label', page: 'Page', rich_text: 'Study note', video: 'Video', image: 'Image', pdf: 'PDF', file: 'File', download: 'Download', external_link: 'External link', embed: 'Embed', practical_activity: 'Practical activity', assignment: 'Assignment', quiz: 'Quiz' };
const playerPath = (courseSlug, target) => target ? `/courses/${courseSlug}/lessons/${target.lessonSlug}/activities/${target.activityId}` : `/courses/${courseSlug}/learn`;

const youtubeEmbedUrl = (url) => {
  const safe = safeExternalUrl(url);
  if (!safe) return null;
  try {
    const parsed = new URL(safe);
    const id = parsed.hostname === 'youtu.be' ? parsed.pathname.slice(1) : parsed.searchParams.get('v');
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  } catch { return null; }
};

const useSecureResource = (resourceId) => {
  const [state, setState] = useState({ url: '', error: '', pending: false });
  useEffect(() => () => { if (state.url) window.URL.revokeObjectURL(state.url); }, [state.url]);
  const open = async (inline = true) => {
    if (!resourceId) return;
    setState({ url: '', error: '', pending: true });
    try {
      const blob = await resourceApi.content(resourceId);
      const url = window.URL.createObjectURL(blob);
      if (inline) window.open(url, '_blank', 'noopener,noreferrer');
      else { const link = document.createElement('a'); link.href = url; link.download = ''; link.click(); }
      setState({ url, error: '', pending: false });
    } catch { setState({ url: '', error: 'This resource is currently unavailable.', pending: false }); }
  };
  return { ...state, open };
};

const ResourceAction = ({ activity, download = false, label }) => {
  const resource = useSecureResource(activity.resourceId);
  if (!activity.resourceId) return <p>Resource unavailable.</p>;
  return <div className="player-resource-action"><button onClick={() => resource.open(!download)} type="button" disabled={resource.pending}>{resource.pending ? 'Preparing resource…' : label || (download ? 'Download file' : 'Open resource')}</button>{resource.error ? <p role="alert">{resource.error}</p> : null}</div>;
};

const SecureImage = ({ resourceId, alt }) => {
  const [state, setState] = useState({ url: '', error: false });
  useEffect(() => {
    let active = true; let objectUrl = '';
    resourceApi.content(resourceId).then((blob) => { objectUrl = window.URL.createObjectURL(blob); if (active) setState({ url: objectUrl, error: false }); }).catch(() => { if (active) setState({ url: '', error: true }); });
    return () => { active = false; if (objectUrl) window.URL.revokeObjectURL(objectUrl); };
  }, [resourceId]);
  if (state.error) return <p role="alert">Image unavailable.</p>;
  return state.url ? <img alt={alt || ''} src={state.url} /> : <p>Loading image…</p>;
};

const HtmlContent = ({ html }) => html ? <div className="player-rich-content" dangerouslySetInnerHTML={{ __html: html }} /> : <p>Content is being prepared.</p>;
const LabelActivity = ({ activity }) => <div className="player-label"><HtmlContent html={activity.content} /></div>;
const VideoActivity = ({ activity }) => {
  const embed = youtubeEmbedUrl(activity.youtubeUrl);
  return embed ? <div className="player-video"><iframe allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" src={embed} title={activity.title} /><a href={safeExternalUrl(activity.youtubeUrl) || undefined} rel="noreferrer" target="_blank">Open video on YouTube</a></div> : <p role="status">This video is unavailable right now.</p>;
};
const ImageActivity = ({ activity }) => activity.resourceId ? <figure className="player-image"><SecureImage alt={activity.config?.altText || activity.title} resourceId={activity.resourceId} />{activity.config?.caption ? <figcaption>{activity.config.caption}</figcaption> : null}</figure> : <p role="alert">Image unavailable.</p>;
const PdfActivity = ({ activity }) => <ResourceAction activity={activity} label="Open PDF" />;
const FileActivity = ({ activity, download }) => <ResourceAction activity={activity} download={download} label={download ? 'Download file' : 'Open file'} />;
const ExternalLinkActivity = ({ activity }) => {
  const url = safeExternalUrl(activity.externalUrl);
  return url ? <a className="button" href={url} rel="noreferrer" target="_blank">Open external learning resource <span className="sr-only">in a new tab</span></a> : <p role="alert">This external resource is unavailable.</p>;
};
const PracticalActivity = ({ activity }) => <div className="player-practical"><HtmlContent html={activity.instructions || activity.content} />{activity.config?.expectedOutput ? <p><strong>Expected outcome:</strong> {activity.config.expectedOutput}</p> : null}{activity.config?.requiredSoftware?.length ? <p><strong>Suggested software:</strong> {activity.config.requiredSoftware.join(', ')}</p> : null}</div>;
const FutureActivity = ({ activity }) => <div className="player-future"><p>{activity.instructions || activity.descriptionEn || 'This activity is being prepared.'}</p><p><strong>{activity.type === 'quiz' ? 'Quiz attempts are not available yet.' : 'Student submission is not available yet.'}</strong></p></div>;
const UnsupportedActivity = () => <p role="status">This learning activity is not supported in the student player yet.</p>;

export const ActivityRenderer = ({ activity }) => {
  if (activity.isLocked) return <section className="player-lock" role="status"><h2>Premium activity</h2><p>This activity is part of the Exam Success Pack. Its learning content is kept private until access is confirmed.</p><Link className="button secondary" to="/store">View Exam Success Pack</Link></section>;
  const renderers = { label: LabelActivity, page: ({ activity: item }) => <HtmlContent html={item.content} />, rich_text: ({ activity: item }) => <HtmlContent html={item.content} />, video: VideoActivity, image: ImageActivity, pdf: PdfActivity, file: FileActivity, download: ({ activity: item }) => <FileActivity activity={item} download />, external_link: ExternalLinkActivity, practical_activity: PracticalActivity, assignment: FutureActivity, quiz: FutureActivity, embed: UnsupportedActivity };
  const Renderer = renderers[activity.type] || UnsupportedActivity;
  return <Renderer activity={activity} />;
};

const ActivityLink = ({ activity, courseSlug, lessonSlug, current }) => <Link aria-current={current ? 'page' : undefined} className={`player-nav-activity ${current ? 'current' : ''} ${activity.isLocked ? 'locked' : ''}`} to={playerPath(courseSlug, { lessonSlug, activityId: activity.id })}><span aria-hidden="true">{activity.isLocked ? '🔒' : activity.progress?.status === 'completed' ? '✓' : '○'}</span><span>{activity.title}</span><small>{activity.isLocked ? 'Premium locked' : typeNames[activity.type] || activity.type}</small></Link>;

export const CourseMap = ({ courseSlug, lessons, currentId, open, onClose }) => <aside className={`student-course-map ${open ? 'open' : ''}`} aria-label="Lesson and topic navigation"><div className="course-map-heading"><strong>Course navigation</strong><button aria-label="Close course navigation" onClick={onClose} type="button">×</button></div>{lessons.map((lesson) => <section className="course-map-lesson" key={lesson.id}><Link to={`/courses/${courseSlug}/lessons/${lesson.slug || lesson.id}`}><span>Lesson {String(lesson.lessonNumber).padStart(2, '0')}</span><strong>{lesson.title}</strong></Link>{lesson.topics.map((topic) => <div className="course-map-topic" key={topic.id}><strong>{topic.title}</strong>{topic.activities.map((activity) => <ActivityLink activity={activity} courseSlug={courseSlug} current={activity.id === currentId} key={activity.id} lessonSlug={lesson.slug || lesson.id} />)}</div>)}</section>)}</aside>;

export const StudentCourseOverview = ({ courseSlug }) => {
  const course = useQuery({ queryKey: queryKeys.learning.player(courseSlug), queryFn: ({ signal }) => learningApi.player(courseSlug, signal) });
  const continuation = useQuery({ queryKey: queryKeys.learning.continue(courseSlug), queryFn: ({ signal }) => learningApi.continue(courseSlug, signal) });
  if (course.isPending) return <LoadingSkeleton label="Loading course" />;
  if (course.isError) return <InlineError error={course.error} onRetry={course.refetch} />;
  const data = course.data;
  return <section className="student-course-overview"><nav aria-label="Breadcrumb" className="breadcrumbs"><Link to="/dashboard">My Courses</Link><span>/</span><span>{data.course.academicLevel?.name}</span><span>/</span><span>{data.course.medium?.name}</span></nav><header><p className="eyebrow">{data.course.medium?.name}</p><h1>{data.course.title}</h1><div className="player-progress"><span>Course progress</span><strong>{data.progress.progressPercent}% complete</strong><progress max="100" value={data.progress.progressPercent} /></div>{continuation.data?.target ? <Link className="button" to={playerPath(courseSlug, continuation.data.target)}>Continue Learning</Link> : null}</header><div className="student-course-lessons">{data.lessons.length ? data.lessons.map((lesson) => <article key={lesson.id}><div><p className="eyebrow">Lesson {String(lesson.lessonNumber).padStart(2, '0')}</p><h2>{lesson.title}</h2>{lesson.summary ? <p>{lesson.summary}</p> : null}<p>{lesson.progress.progressPercent}% complete · {lesson.topics.flatMap((topic) => topic.activities).filter((activity) => activity.accessPolicy === 'free').length} free activities</p><progress aria-label={`${lesson.title} progress`} max="100" value={lesson.progress.progressPercent} /></div><div>{lesson.topics.map((topic) => <section key={topic.id}><h3>{topic.title}</h3>{topic.activities.map((activity) => <ActivityLink activity={activity} courseSlug={courseSlug} key={activity.id} lessonSlug={lesson.slug || lesson.id} />)}</section>)}</div></article>) : <EmptyState title="No learning activities are available in this course yet." />}</div></section>;
};

export const StudentActivityPlayer = () => {
  const { courseSlug, lessonSlug, activityId } = useParams();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [mapOpen, setMapOpen] = useState(false);
  const queryClient = useQueryClient();
  const detail = useQuery({ queryKey: queryKeys.learning.playerActivity(courseSlug, lessonSlug, activityId), queryFn: ({ signal }) => learningApi.playerActivity(courseSlug, lessonSlug, activityId, signal), enabled: isAuthenticated });
  const completion = useMutation({ mutationFn: (completed) => learningApi.setManualCompletion(courseSlug, lessonSlug, activityId, completed), onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.learning.player(courseSlug) }); queryClient.invalidateQueries({ queryKey: queryKeys.learning.continue(courseSlug) }); queryClient.invalidateQueries({ queryKey: queryKeys.learning.playerActivity(courseSlug, lessonSlug, activityId) }); } });
  const data = detail.data;
  const activity = data?.current;
  const isManual = activity?.completionMode === 'manual';
  const isComplete = activity?.progress?.status === 'completed';
  useEffect(() => { setMapOpen(false); }, [activityId]);
  if (!isAuthenticated) return <section className="login-cta"><p className="eyebrow">Student sign in</p><h1>Sign in to continue learning.</h1><p>Google sign-in keeps your activity progress and next lesson safe.</p><a className="button" href={`${serviceUrls.auth}/api/v1/auth/google?returnTo=${encodeURIComponent(location.pathname)}`}>Continue with Google</a></section>;
  if (detail.isPending) return <LoadingSkeleton label="Loading activity" />;
  if (detail.isError) return <InlineError error={detail.error} onRetry={detail.refetch} />;
  return <section className="student-player"><nav aria-label="Breadcrumb" className="breadcrumbs"><Link to="/dashboard">My Courses</Link><span>/</span><Link to={`/courses/${courseSlug}/learn`}>{data.course.title}</Link><span>/</span><span>{activity.title}</span></nav><header className="student-player-header"><div><p className="eyebrow">{typeNames[activity.type] || 'Learning activity'}</p><h1>{activity.title}</h1><p>{data.course.medium?.name} · {data.progress.progressPercent}% course complete</p></div><button aria-controls="student-course-map" aria-expanded={mapOpen} onClick={() => setMapOpen(true)} type="button">Course navigation</button></header><div className="student-player-layout"><div id="student-course-map"><CourseMap courseSlug={courseSlug} currentId={activityId} lessons={data.lessons} onClose={() => setMapOpen(false)} open={mapOpen} /></div><main className="student-activity"><ActivityRenderer activity={activity} />{isManual ? <div className="player-completion"><button disabled={completion.isPending} onClick={() => completion.mutate(!isComplete)} type="button">{isComplete ? 'Mark incomplete' : 'Mark complete'}</button>{completion.error ? <p role="alert">Unable to update completion. Please try again.</p> : null}</div> : activity.completionMode === 'view' ? <p className="completion-note">Marked complete when opened.</p> : ['submit', 'pass'].includes(activity.completionMode) ? <p className="completion-note">Completion will be recorded when the required learning workflow is available.</p> : null}<nav className="player-next-previous" aria-label="Activity navigation">{data.previous ? <Link to={playerPath(courseSlug, data.previous)}>← Previous <span className="sr-only">activity</span></Link> : <span />}{data.next ? <Link to={playerPath(courseSlug, data.next)}>Next <span className="sr-only">activity</span> →</Link> : <Link to={`/courses/${courseSlug}/learn`}>Return to course</Link>}</nav></main></div></section>;
};
