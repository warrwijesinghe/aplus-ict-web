import { createBrowserRouter, Navigate } from 'react-router-dom';
import { GuestOnlyRoute } from '../auth/guest-only-route.jsx';
import { ProtectedRoute } from '../auth/protected-route.jsx';
import { RoleRoute } from '../auth/role-route.jsx';
import { AuthLayout } from '../layouts/AuthLayout.jsx';
import { PublicLayout } from '../layouts/PublicLayout.jsx';
import { StudentLayout } from '../layouts/StudentLayout.jsx';
import { LessonExperienceLayout } from '../layouts/LessonExperienceLayout.jsx';
import { PhoneAuthPage } from '../pages/PhoneAuthPage.jsx';
import { ReviewAccessPage } from '../pages/ReviewAccessPage.jsx';
import { EnrollmentPage } from '../pages/EnrollmentPage.jsx';
import { LessonLandingPage } from '../pages/LessonLandingPage.jsx';
import { CompleteProfilePage, LearningHistoryPage, MyCoursesPage, ProfileCompletionGuard, StudentDashboard, StudentProfilePage } from '../pages/StudentExperiencePages.jsx';
import { LogoutPage } from '../pages/LogoutPage.jsx';
import {
  AboutPage,
  ContactPage,
  CourseLearningPage,
  LessonLearningPage,
  PublicCourseDetailPage,
  StudentGuidePage
} from '../pages/PublicCoursePages.jsx';
import { PublicResourcesPage } from '../pages/PublicResourcesPage.jsx';
import { StudentActivityPlayer } from '../components/learning/StudentLessonPlayer.jsx';
import { ExamSuccessPackPage, StudentOrderDetailPage, StudentOrdersPage } from '../pages/ExamSuccessPackPage.jsx';
import { CourseSelectionPage } from '../pages/CourseSelectionPage.jsx';
import { StudentGradebook } from '../components/learning/StudentGradebook.jsx';
import { PrivacyPolicyPage, RefundPolicyPage, TermsPage } from '../pages/LegalPages.jsx';
import { AlIctPage, DegreePage, OlIctPage, PlatformHomePage, ProfessionalCertificationsPage, SchoolIctPage, ShortCoursesPage } from '../pages/AcademicAreaPages.jsx';
import {
  CurriculumPage,
  LessonPreviewPage,
  NewOrderPage,
  NotFoundPage,
  OrderDetailPage,
  OrdersPage,
  PaymentPage,
  ProductDetailPage,
  ProgressPage,
  ServiceUnavailablePage,
  StorePage,
  StudentLessonPage,
  UnauthorizedPage
} from '../pages/pages.jsx';

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <PlatformHomePage /> },
      { path: '/al-ict', element: <AlIctPage /> },
      { path: '/ol-ict', element: <OlIctPage /> },
      { path: '/school-ict', element: <SchoolIctPage /> },
      { path: '/degree', element: <DegreePage /> },
      { path: '/professional-certifications', element: <ProfessionalCertificationsPage /> },
      { path: '/short-courses', element: <ShortCoursesPage /> },
      { path: '/courses', element: <CourseSelectionPage /> },
      { path: '/courses/:courseSlug', element: <PublicCourseDetailPage /> },
      { path: '/courses/:courseSlug/lessons/:lessonSlug', element: <LessonLandingPage /> },
      { path: '/enroll/:courseSlug', element: <EnrollmentPage /> },
      { path: '/resources', element: <PublicResourcesPage /> },
      { path: '/free-lessons', element: <PublicResourcesPage /> },
      { path: '/student-guide', element: <StudentGuidePage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/contact', element: <ContactPage /> },
      { path: '/privacy-policy', element: <PrivacyPolicyPage /> },
      { path: '/terms', element: <Navigate replace to="/terms-and-conditions" /> },
      { path: '/terms-and-conditions', element: <TermsPage /> },
      { path: '/refund-policy', element: <RefundPolicyPage /> },
      { path: '/cancellation-policy', element: <Navigate replace to="/refund-policy" /> },
      { path: '/payment-policy', element: <Navigate replace to="/terms-and-conditions" /> },
      { path: '/courses/:courseId/curriculum', element: <CurriculumPage /> },
      { path: '/lessons/:lessonId/preview', element: <LessonPreviewPage /> },
      { path: '/store', element: <StorePage /> },
      { path: '/store/products/:productSlug', element: <ProductDetailPage /> },
      { path: '/logout', element: <LogoutPage /> }
    ]
  },
  {
    element: <LessonExperienceLayout />,
    children: [
      { path: '/courses/:courseSlug/learn', element: <CourseLearningPage /> },
      { path: '/courses/:courseSlug/lessons/:lessonSlug/activities/:activityId', element: <StudentActivityPlayer /> },
      { path: '/courses/:courseSlug/lessons/:lessonSlug/topics/:topicId', element: <LessonLearningPage /> },
      { path: '/courses/:courseSlug/lessons/:lessonSlug/learn', element: <LessonLearningPage /> }
    ]
  },
  {
    element: <GuestOnlyRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [{ path: '/login', element: <PhoneAuthPage key="login" /> }, { path: '/register', element: <PhoneAuthPage key="register" mode="register" /> }, { path: '/forgot-password', element: <PhoneAuthPage key="reset" mode="reset" /> }, { path: '/review-access', element: <ReviewAccessPage /> }]
      }
    ]
  },
  {
    element: <AuthLayout />,
    children: [{ path: '/login/success', element: <Navigate replace to="/login" /> }]
  },
  { path: '/unauthorized', element: <UnauthorizedPage /> },
  { path: '/service-unavailable', element: <ServiceUnavailablePage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleRoute roles={['student']} />,
        children: [
          { path: '/complete-profile', element: <CompleteProfilePage /> },
          {
            element: <ProfileCompletionGuard />,
            children: [
              {
                element: <StudentLayout />,
                children: [
              { path: '/profile', element: <StudentProfilePage /> },
              { path: '/dashboard', element: <StudentDashboard /> },
              { path: '/dashboard/courses', element: <MyCoursesPage /> },
              { path: '/dashboard/profile', element: <StudentProfilePage /> },
              { path: '/my-courses', element: <MyCoursesPage /> },
              { path: '/learning-history', element: <LearningHistoryPage /> },
              { path: '/courses/:courseSlug/lessons/:lessonSlug/exam-success-pack', element: <ExamSuccessPackPage /> },
              { path: '/student', element: <StudentDashboard /> },
              { path: '/student/explore', element: <CourseSelectionPage student /> },
              { path: '/student/courses', element: <MyCoursesPage /> },
              { path: '/student/courses/:courseId', element: <ProgressPage /> },
              { path: '/student/courses/:courseId/progress', element: <ProgressPage /> },
              { path: '/student/courses/:courseTrackId/grades', element: <StudentGradebook /> },
              { path: '/student/lessons/:lessonId', element: <StudentLessonPage /> },
              { path: '/student/orders', element: <StudentOrdersPage /> },
              { path: '/student/orders/new', element: <StudentOrdersPage /> },
              { path: '/student/orders/:orderId', element: <StudentOrderDetailPage /> },
              { path: '/student/orders/:orderId/payment', element: <StudentOrderDetailPage /> },
              { path: '/student/orders/:orderId/payment/:paymentMethod', element: <StudentOrderDetailPage /> },
              { path: '/student/orders/:orderId/payment/:paymentMethod/:paymentStep', element: <StudentOrderDetailPage /> },
              { path: '/student/profile', element: <StudentProfilePage /> }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  { path: '*', element: <NotFoundPage /> }
]);
