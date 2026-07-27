import { useQuery } from '@tanstack/react-query';
import { Link, Navigate, useParams } from 'react-router-dom';
import { contentApi } from '../api/content.api.js';
import { queryKeys } from '../api/query-keys.js';
import { EmptyState, LoadingSkeleton } from '../components/common/States.jsx';
import {
  alIctTracks,
  unpublishedLessons
} from '../features/public-catalog/catalogue-placeholders.js';

const LessonCard = ({ lesson, trackKey }) => (
  <article className={`lesson-card${lesson.isPlaceholder ? ' lesson-card-placeholder' : ''}`}>
    <p className="lesson-number">Lesson {String(lesson.lessonNumber).padStart(2, '0')}</p>
    <h2>{lesson.title}</h2>
    <p>{lesson.summary || 'Lesson summary will be published soon.'}</p>
    {!lesson.isPlaceholder && (
      <p className="catalogue-meta">
        <span>{lesson.freeChapterCount} Free</span>
        <span>{lesson.paidChapterCount} Paid</span>
      </p>
    )}
    {lesson.isPlaceholder ? (
      <span className="catalogue-status">Preparing catalogue</span>
    ) : (
      <Link className="text-link" to={`/al-ict/${trackKey}/lessons/${lesson.slug}`}>
        View lesson preview <span aria-hidden="true">→</span>
      </Link>
    )}
  </article>
);

export const AlIctLandingPage = () => {
  const course = useQuery({
    queryKey: queryKeys.content.publicAlIctCourse,
    queryFn: ({ signal }) => contentApi.publicAlIctCourse(signal),
    retry: false
  });
  const hasLiveTracks = course.data?.data?.tracks?.length > 0;
  return (
    <>
      <section className="catalogue-hero">
        <p className="eyebrow">A/L ICT · 2026+</p>
        <h1>ඔබගේ A/L ICT learning path එක මෙතැනින් පටන් ගන්න.</h1>
        <p>
          Sinhala සහ English Medium දෙකෙන්ම, syllabus lessons 13, Free Chapters සහ structured
          learning flow එකක් එක් තැනකින්.
        </p>
      </section>
      <section
        aria-labelledby="medium-selection-title"
        className="medium-section"
        id="free-lessons"
      >
        <div className="section-heading">
          <p className="eyebrow">Choose your medium</p>
          <h2 id="medium-selection-title">ඔබ ඉගෙන ගන්නා මාධ්‍යය තෝරන්න</h2>
        </div>
        <div className="medium-grid">
          {Object.entries(alIctTracks).map(([key, track]) => (
            <Link className="medium-card" key={key} to={`/al-ict/${key}`}>
              <span className="medium-icon" aria-hidden="true">
                {key === 'sinhala-medium' ? 'සි' : 'EN'}
              </span>
              <h3>{track.label}</h3>
              <p>{track.description}</p>
              <span>Explore 13 lessons →</span>
            </Link>
          ))}
        </div>
        {course.isLoading && <p className="catalogue-note">Checking the published catalogue…</p>}
        {hasLiveTracks && (
          <p className="catalogue-note">Published lesson and chapter counts are now available.</p>
        )}
      </section>
      <section className="next-section">
        <p className="eyebrow">O/L ICT</p>
        <h2>Coming later</h2>
        <p>මෙම Phase 1 catalogue එක A/L ICT සඳහා පමණක් සකස් කර ඇත.</p>
      </section>
    </>
  );
};

export const AlIctTrackPage = () => {
  const { medium } = useParams();
  const track = alIctTracks[medium];
  const lessons = useQuery({
    queryKey: queryKeys.content.publicTrackLessons(track?.apiSlug),
    queryFn: ({ signal }) => contentApi.publicTrackLessons(track.apiSlug, signal),
    enabled: Boolean(track),
    retry: false
  });
  if (!track) return <Navigate replace to="/al-ict" />;
  const liveLessons = lessons.data?.data?.lessons || [];
  const showPlaceholders = lessons.isError || (!lessons.isLoading && liveLessons.length === 0);
  const visibleLessons = showPlaceholders ? unpublishedLessons : liveLessons;
  return (
    <>
      <section className="track-heading">
        <Link className="back-link" to="/al-ict">
          ← A/L ICT
        </Link>
        <p className="eyebrow">A/L ICT · {track.medium}</p>
        <h1>{track.label}</h1>
        <p>{track.description}</p>
      </section>
      {lessons.isLoading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {showPlaceholders && (
            <div className="catalogue-notice" role="status">
              <strong>13-lesson catalogue structure</strong>
              <span>
                Official titles and chapter information are shown only after content is published.
              </span>
            </div>
          )}
          <div className="lesson-grid">
            {visibleLessons.map((lesson) => (
              <LessonCard key={lesson.id || lesson.code} lesson={lesson} trackKey={medium} />
            ))}
          </div>
        </>
      )}
    </>
  );
};

export const AlIctLessonPreviewPage = () => {
  const { medium, lessonSlug } = useParams();
  const track = alIctTracks[medium];
  const lesson = useQuery({
    queryKey: queryKeys.content.publicTrackLesson(track?.apiSlug, lessonSlug),
    queryFn: ({ signal }) => contentApi.publicTrackLesson(track.apiSlug, lessonSlug, signal),
    enabled: Boolean(track && lessonSlug),
    retry: false
  });
  if (!track) return <Navigate replace to="/al-ict" />;
  if (lesson.isLoading) return <LoadingSkeleton />;
  if (lesson.error) {
    return (
      <EmptyState title="This lesson preview is not published yet">
        <p>Only published A/L ICT lesson information is available publicly.</p>
        <Link to={`/al-ict/${medium}`}>Return to the 13-lesson catalogue</Link>
      </EmptyState>
    );
  }
  const data = lesson.data.data;
  return (
    <>
      <section className="track-heading">
        <Link className="back-link" to={`/al-ict/${medium}`}>
          ← {track.label} catalogue
        </Link>
        <p className="eyebrow">
          Lesson {String(data.lessonNumber).padStart(2, '0')} · {track.medium}
        </p>
        <h1>{data.title}</h1>
        <p>{data.summary}</p>
        <p className="catalogue-meta">
          <span>{data.freeChapterCount} Free Chapters</span>
          <span>{data.paidChapterCount} Locked Chapters</span>
        </p>
      </section>
      {data.chapters.length ? (
        <ol className="chapter-list">
          {data.chapters.map((chapter) => (
            <li
              className={chapter.isLocked ? 'chapter chapter-locked' : 'chapter'}
              key={chapter.id}
            >
              <span className="chapter-order">{String(chapter.displayOrder).padStart(2, '0')}</span>
              <div>
                <h2>{chapter.title}</h2>
                {chapter.summary && <p>{chapter.summary}</p>}
              </div>
              <span className={chapter.isLocked ? 'access-badge locked' : 'access-badge'}>
                {chapter.isLocked ? 'Locked · Paid' : 'Free'}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState title="Chapter previews are coming soon" />
      )}
      <section className="login-cta">
        <p className="eyebrow">Student account</p>
        <h2>Free chapters සහ learning progress එක සඳහා sign in කරන්න.</h2>
        <p>
          Google-only student sign-in is planned; this MVP does not yet include a Google OAuth
          route.
        </p>
        <Link className="button" to="/login">
          Student Login
        </Link>
      </section>
    </>
  );
};
