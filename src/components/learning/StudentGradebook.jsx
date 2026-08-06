import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { learningApi } from '../../api/learning.api.js';
import { InlineError, LoadingSkeleton } from '../common/States.jsx';

export const StudentGradebook = () => {
  const { courseTrackId } = useParams();
  const gradebook = useQuery({ queryKey: ['learning', 'gradebook', courseTrackId], queryFn: ({ signal }) => learningApi.courseGradebook(courseTrackId, signal) });
  if (gradebook.isPending) return <LoadingSkeleton label="Loading grades" />;
  if (gradebook.isError) return <InlineError error={gradebook.error} onRetry={gradebook.refetch} />;
  const data = gradebook.data;
  return <section className="student-gradebook"><nav className="breadcrumbs"><Link to="/dashboard">My Courses</Link><span>/</span><span>Grades</span></nav><header><p className="eyebrow">{data.course.medium}</p><h1>{data.course.title} grades</h1><p>{data.completion.percentage}% complete · {data.passFail.replaceAll('_', ' ')}</p></header><div className="gradebook-summary"><article><span>Completion</span><strong>{data.completion.percentage}%</strong></article><article><span>Overall grade</span><strong>{data.overallGrade === null ? 'Pending' : `${data.overallGrade}%`}</strong></article><article><span>Result</span><strong>{data.passFail}</strong></article></div><section><h2>Quiz results</h2>{data.quizzes.length ? data.quizzes.map((quiz) => <article className="grade-card" key={quiz.quizId}><div><h3>{quiz.title}</h3><p>{quiz.pendingManualGrading ? 'Pending manual grading' : `Attempt used: ${quiz.attemptId || quiz.gradingMethod || '—'}`}</p></div><strong>{quiz.percentage === undefined ? 'Not attempted' : `${quiz.percentage}%`}</strong></article>) : <p>No graded activities are available yet.</p>}</section><section><h2>Teacher comments</h2>{data.comments.length ? data.comments.map((comment) => <article className="grade-card" key={comment.id}><p>{comment.comment}</p><small>Updated {new Date(comment.updatedAt).toLocaleDateString()}</small></article>) : <p>No teacher comments yet.</p>}</section></section>;
};
