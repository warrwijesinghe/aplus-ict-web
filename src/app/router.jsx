import { createBrowserRouter } from 'react-router-dom';
import { GuestOnlyRoute } from '../auth/guest-only-route.jsx';
import { PermissionRoute } from '../auth/permission-route.jsx';
import { ProtectedRoute } from '../auth/protected-route.jsx';
import { RoleRoute } from '../auth/role-route.jsx';
import { AdminLayout } from '../layouts/AdminLayout.jsx';
import { AuthLayout } from '../layouts/AuthLayout.jsx';
import { PublicLayout } from '../layouts/PublicLayout.jsx';
import { StudentLayout } from '../layouts/StudentLayout.jsx';
import { TeacherLayout } from '../layouts/TeacherLayout.jsx';
import { AlIctLandingPage, AlIctLessonPreviewPage, AlIctTrackPage } from '../pages/AlIctPages.jsx';
import {
  AdminDashboard,
  AdminListPage,
  CourseDetailPage,
  CoursesPage,
  CurriculumPage,
  HomePage,
  LessonPreviewPage,
  LoginPage,
  NewOrderPage,
  NotFoundPage,
  OrderDetailPage,
  OrdersPage,
  PaymentPage,
  ProductDetailPage,
  ProfilePage,
  ProgressPage,
  RegisterPage,
  ServiceUnavailablePage,
  StorePage,
  StudentCoursesPage,
  StudentDashboard,
  StudentLessonPage,
  TeacherContentPage,
  TeacherDashboard,
  UnauthorizedPage
} from '../pages/pages.jsx';

const plannedAdmin = <AdminListPage />;
export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/al-ict', element: <AlIctLandingPage /> },
      { path: '/al-ict/:medium', element: <AlIctTrackPage /> },
      { path: '/al-ict/:medium/lessons/:lessonSlug', element: <AlIctLessonPreviewPage /> },
      { path: '/courses', element: <CoursesPage /> },
      { path: '/courses/:courseSlug', element: <CourseDetailPage /> },
      { path: '/courses/:courseId/curriculum', element: <CurriculumPage /> },
      { path: '/lessons/:lessonId/preview', element: <LessonPreviewPage /> },
      { path: '/store', element: <StorePage /> },
      { path: '/store/products/:productSlug', element: <ProductDetailPage /> }
    ]
  },
  {
    element: <GuestOnlyRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> }
        ]
      }
    ]
  },
  { path: '/unauthorized', element: <UnauthorizedPage /> },
  { path: '/service-unavailable', element: <ServiceUnavailablePage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleRoute roles={['student']} />,
        children: [
          {
            element: <StudentLayout />,
            children: [
              { path: '/student', element: <StudentDashboard /> },
              { path: '/student/courses', element: <StudentCoursesPage /> },
              { path: '/student/courses/:courseId', element: <ProgressPage /> },
              { path: '/student/courses/:courseId/progress', element: <ProgressPage /> },
              { path: '/student/lessons/:lessonId', element: <StudentLessonPage /> },
              { path: '/student/orders', element: <OrdersPage /> },
              { path: '/student/orders/new', element: <NewOrderPage /> },
              { path: '/student/orders/:orderId', element: <OrderDetailPage /> },
              { path: '/student/orders/:orderId/payment', element: <PaymentPage /> },
              { path: '/student/profile', element: <ProfilePage /> }
            ]
          }
        ]
      },
      {
        element: <RoleRoute roles={['teacher', 'admin', 'super_admin']} />,
        children: [
          {
            element: <TeacherLayout />,
            children: [
              { path: '/teacher', element: <TeacherDashboard /> },
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
              { path: '/admin/content/courses', element: plannedAdmin },
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
