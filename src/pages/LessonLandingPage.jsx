import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { contentApi } from '../api/content.api.js';
import { queryKeys } from '../api/query-keys.js';
import { useAuth } from '../auth/auth-context.jsx';
import { useCourseEnrollment } from '../features/student/hooks.js';
import { EmptyState, InlineError, LoadingSkeleton } from '../components/common/States.jsx';
import { LessonValueFeatures, TutorialHighlight, LmsFeatures, WhyAPlusICT, LessonFinalCTA, LessonOutline } from '../components/courses/LessonLandingSections.jsx';
import { LessonHero } from '../components/courses/LessonHero.jsx';
import { LessonIntroduction } from '../components/courses/LessonIntroduction.jsx';
import { LessonSectionCTA } from '../components/courses/LessonSectionCTA.jsx';
import { lessonLandingSinhala } from '../components/courses/lesson-landing-copy.js';
import { formatLkr, lessonPriceFor } from '../config/lesson-pricing.js';
import { academicAreaDetails, mediumForCourse } from '../utils/academic-course.js';
import { usePageSeo } from '../seo/use-page-seo.js';
import '../styles/lesson-landing.css';

export const LessonLanding = ({ course, lesson, courseSlug, lessonSlug, isAuthenticated = false, isEnrolled = false }) => {
  const base = `/courses/${courseSlug}/lessons/${lessonSlug}`;
  const content = lesson.landingPageContent || {};
  const medium = mediumForCourse(course);
  const sinhala = medium === 'si';
  const t = (english, si) => sinhala ? si || lessonLandingSinhala[english] || english : english;
  const mediumLabel = sinhala ? 'සිංහල මාධ්‍යය' : medium === 'en' ? 'English Medium' : course.medium?.nameEn || course.medium?.name || 'ICT learning';
  const courseTitle = sinhala ? course.titleSi || course.title || course.titleEn : course.titleEn || course.title || course.titleSi;
  const area = academicAreaDetails(course);
  const areaLabel = sinhala ? ({ AL: 'උසස් පෙළ තොරතුරු තාක්ෂණය', OL: 'සාමාන්‍ය පෙළ තොරතුරු තාක්ෂණය', SCHOOL: 'පාසල් තොරතුරු තාක්ෂණය', DEGREE: 'උපාධි පාඨමාලා', PROFESSIONAL: 'වෘත්තීය පාඨමාලා', SHORT_COURSES: 'කෙටි පාඨමාලා' }[area.area] || course.title) : area.area === 'SCHOOL' ? course.title : area.label;
  const examCourse = ['AL', 'OL', 'SCHOOL'].includes(area.area);
  const comingSoon = lesson.isPublished === false || ['draft', 'archived'].includes(lesson.status) || ['inactive', 'coming_soon'].includes(lesson.availabilityStatus);
  const unlocked = Boolean(lesson.premiumUnlocked);
  const canBuy = !comingSoon && !unlocked && Boolean(lesson.unlockProduct) && !['inactive', 'archived', 'draft'].includes(lesson.unlockProduct?.status);
  const enroll = `/enroll/${courseSlug}?returnTo=${encodeURIComponent(base + '/learn')}`;
  const model = {
    course, lesson, content, mediumLabel, areaLabel, courseTitle, examCourse, comingSoon, sinhala, t, area: area.area,
    price: formatLkr(lessonPriceFor({ product: lesson.unlockProduct }))?.replace('LKR', sinhala ? 'රු.' : 'LKR'),
    freeLabel: unlocked ? t('Continue Lesson', 'පාඩම දිගටම ඉගෙන ගන්න') : isAuthenticated && isEnrolled ? t('Continue Free Lesson', 'නොමිලේ පාඩම දිගටම ඉගෙන ගන්න') : isAuthenticated ? t('Start Free Lesson', 'නොමිලේ පාඩම අරඹන්න') : t('Start Learning Free Now', 'දැන් නොමිලේ ඉගෙනීම අරඹන්න'),
    freeTo: unlocked || (isAuthenticated && isEnrolled) ? base + '/learn' : enroll,
    buyTo: isAuthenticated && isEnrolled ? base + '/exam-success-pack' : `/enroll/${courseSlug}?returnTo=${encodeURIComponent(base + '/exam-success-pack')}`,
    canBuy, unlocked,
  };
  return <div className="lesson-sales-page" lang={sinhala ? 'si' : 'en'}>
    <LessonHero model={model} />
    <LessonIntroduction model={model} />
    <LessonSectionCTA model={model} placement="introduction" />
    <LessonValueFeatures model={model} />
    <TutorialHighlight model={model} />
    <LessonSectionCTA model={model} placement="tutorial" />
    <LmsFeatures model={model} />
    <LessonSectionCTA model={model} placement="lms" />
    {(content.overview || content.syllabus?.length > 0) && <LessonOutline content={content} model={model} />}
    <WhyAPlusICT model={model} />
    <LessonFinalCTA model={model} />
  </div>;
};

export const LessonLandingPage = () => {
  const { courseSlug, lessonSlug } = useParams();
  const { isAuthenticated } = useAuth();
  const query = useQuery({ queryKey: queryKeys.content.publicLesson(courseSlug, lessonSlug), queryFn: ({ signal }) => contentApi.publicLesson(courseSlug, lessonSlug, signal) });
  const { course, lesson } = query.data?.data || {};
  const sinhala = mediumForCourse(course) === 'si' || (!course && /(?:^|-)sinhala(?:-|$)/.test(courseSlug));
  const enrollment = useCourseEnrollment(course?.id, isAuthenticated && Boolean(course?.id));
  usePageSeo({ title: lesson ? lesson.title : sinhala ? 'තොරතුරු තාක්ෂණ පාඩම' : 'ICT lesson', description: lesson?.landingPageContent?.heroDescription || (sinhala ? 'තොරතුරු තාක්ෂණය නොමිලේ ඉගෙනීම අරඹන්න. වීඩියෝ පාඩම්, මුද්‍රිත නිබන්ධන සහ පුහුණු ප්‍රශ්න සමඟ ඉගෙන ගන්න.' : 'Start learning ICT free. Explore exam-focused lessons, printed tutorials and LMS learning tools.'), path: `/courses/${courseSlug}/lessons/${lessonSlug}` });
  if (query.isPending) return <LoadingSkeleton label={sinhala ? 'පාඩම පූරණය වෙමින් පවතී' : 'Loading lesson'} />;
  if (query.isError) return <InlineError error={query.error} onRetry={query.refetch} />;
  if (!lesson || !course) return <EmptyState title={sinhala ? 'මෙම පාඩම දැනට ලබා ගත නොහැක' : 'This lesson is not available'} />;
  return <LessonLanding course={course} lesson={lesson} courseSlug={courseSlug} lessonSlug={lessonSlug} isAuthenticated={isAuthenticated} isEnrolled={Boolean(enrollment.data)} />;
};
