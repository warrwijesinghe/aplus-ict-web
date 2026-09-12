import { createBrowserRouter, Navigate } from 'react-router-dom';
import { GuestOnlyRoute } from '../auth/guest-only-route.jsx';
import { PermissionRoute } from '../auth/permission-route.jsx';
import { ProtectedRoute } from '../auth/protected-route.jsx';
import { RoleRoute } from '../auth/role-route.jsx';
import { AdminLayout } from '../layouts/AdminLayout.jsx';
import { AuthLayout } from '../layouts/AuthLayout.jsx';
import { PublicLayout } from '../layouts/PublicLayout.jsx';
import { StudentLayout } from '../layouts/StudentLayout.jsx';
import { LessonExperienceLayout } from '../layouts/LessonExperienceLayout.jsx';
import { TeacherLayout } from '../layouts/TeacherLayout.jsx';
import { PhoneAuthPage } from '../pages/PhoneAuthPage.jsx';
import { ReviewAccessPage } from '../pages/ReviewAccessPage.jsx';
import { EnrollmentPage } from '../pages/EnrollmentPage.jsx';
import { CompleteProfilePage, LearningHistoryPage, MyCoursesPage, ProfileCompletionGuard, StudentDashboard, StudentProfilePage } from '../pages/StudentExperiencePages.jsx';
import { AdminContentPage } from '../pages/AdminContentPage.jsx';
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
import { StudentGradebook } from '../components/learning/StudentGradebook.jsx';
import { PrivacyPolicyPage, RefundPolicyPage, TermsPage } from '../pages/LegalPages.jsx';
import { AlIctPage, OlIctPage, PlatformHomePage, SchoolIctPage } from '../pages/AcademicAreaPages.jsx';
import {
  AdminDashboard,
  AdminListPage,
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
  TeacherContentPage,
  TeacherCoursePage,
  TeacherCoursesPage,
  TeacherDashboard,
  UnauthorizedPage
} from '../pages/pages.jsx';

const plannedAdmin = <AdminListPage />;
export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <PlatformHomePage /> },
      { path: '/al-ict', element: <AlIctPage /> },
      { path: '/ol-ict', element: <OlIctPage /> },
      { path: '/school-ict', element: <SchoolIctPage /> },
      { path: '/courses', element: <Navigate replace to="/#pathways" /> },
      { path: '/courses/:courseSlug', element: <PublicCourseDetailPage /> },
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
      { path: '/courses/:courseSlug/lessons/:lessonSlug', element: <LessonLearningPage /> }
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
      },
      {
        element: <RoleRoute roles={['teacher', 'content_editor', 'admin', 'super_admin']} />,
        children: [
          {
            element: <TeacherLayout />,
            children: [
              { path: '/teacher', element: <TeacherDashboard /> },
              { path: '/teacher/courses', element: <TeacherCoursesPage /> },
              { path: '/teacher/courses/:trackId', element: <TeacherCoursePage /> },
              { path: '/teacher/content', element: <TeacherContentPage /> },
              { path: '/teacher/content/subjects', element: <TeacherContentPage /> },
              { path: '/teacher/content/courses', element: <TeacherContentPage /> }
            ]
          }
        ]
      },
      {
        element: <RoleRoute roles={['admin', 'super_admin']} />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { path: '/admin', element: <AdminDashboard /> },
              { path: '/admin/content/subjects', element: plannedAdmin },
              { path: '/admin/content/courses', element: <AdminContentPage /> },
              { path: '/admin/content/modules', element: plannedAdmin },
              { path: '/admin/content/lessons', element: plannedAdmin },
              {
                element: <PermissionRoute permissions={['learning.enrolments.read']} />,
                children: [
                  { path: '/admin/learning/enrolments', element: plannedAdmin },
                  { path: '/admin/learning/progress', element: plannedAdmin }
                ]
              },
              {
                element: (
                  <PermissionRoute
                    permissions={['resources.read', 'resources.read_all', 'resources.manage']}
                  />
                ),
                children: [{ path: '/admin/resources', element: plannedAdmin }]
              },
              {
                element: <PermissionRoute permissions={['commerce.products.read']} />,
                children: [{ path: '/admin/commerce/products', element: plannedAdmin }]
              },
              {
                element: <PermissionRoute permissions={['commerce.orders.read_all']} />,
                children: [{ path: '/admin/commerce/orders', element: plannedAdmin }]
              },
              {
                element: <PermissionRoute permissions={['commerce.payments.read']} />,
                children: [
                  { path: '/admin/commerce/payments', element: plannedAdmin },
                  { path: '/admin/commerce/fulfilments', element: plannedAdmin }
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
