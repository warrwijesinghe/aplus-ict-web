import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { commerceApi } from '../api/commerce.api.js';
import { contentApi } from '../api/content.api.js';
import { learningApi } from '../api/learning.api.js';
import { educatorApi } from '../api/educator.api.js';
import { queryKeys } from '../api/query-keys.js';
import { resourceApi } from '../api/resource.api.js';
import { useAuth } from '../auth/auth-context.jsx';
import {
  EmptyState,
  InlineError,
  LoadingSkeleton,
  StatusBadge
} from '../components/common/States.jsx';
import { ResourceImage } from '../components/resources/ResourceImage.jsx';
import { useOrderSelection } from '../features/store/selection-context.jsx';
import { formatCurrency } from '../utils/currency.js';
import { formatDate } from '../utils/date-time.js';
import { safeExternalUrl } from '../utils/safe-url.js';
import { EnrollmentDashboard, StudentProfilePage } from './StudentExperiencePages.jsx';

const dataItems = (result) => result?.data?.items || [];
const PageError = ({ error }) => <InlineError error={error} />;
const zodResolver = (schema) => async (values) => {
  const result = schema.safeParse(values);
  if (result.success) return { values: result.data, errors: {} };
  return {
    values: {},
    errors: result.error.issues.reduce(
      (errors, issue) => ({
        ...errors,
        [issue.path[0]]: { type: 'validation', message: issue.message }
      }),
      {}
    )
  };
};
const Field = ({ label, name, register, error, type = 'text', ...props }) => (
  <label>
    {label}
    <input aria-invalid={Boolean(error)} {...register(name)} type={type} {...props} />
    {error && <small className="field-error">{error.message}</small>}
  </label>
);
const Card = ({ children }) => <article className="card">{children}</article>;

export const HomePage = () => {
  return (
    <>
      <section className="hero al-ict-hero">
        <div>
          <p className="eyebrow">A Plus ICT · Sri Lanka</p>
          <h1>A/L ICT — Learn Free. Progress Further.</h1>
          <p>
            සිංහල සහ English Medium දෙකෙන්ම A/L ICT පාඩම් 13 ක්, Free Chapters, Structured LMS සහ
            paid lesson access එකම learning flow එකකින්.
          </p>
          <p className="hero-actions">
            <Link className="button" to="/al-ict">
              Explore A/L ICT Lessons
            </Link>
            <Link className="button secondary" to="/login">
              Student Login
            </Link>
          </p>
          <p className="google-note">Google student sign-in is planned for a future phase.</p>
        </div>
        <div className="hero-stat-grid" aria-label="A/L ICT catalogue highlights">
          <p>
            <strong>13</strong>
            <span>Syllabus lessons</span>
          </p>
          <p>
            <strong>2</strong>
            <span>Learning media</span>
          </p>
          <p>
            <strong>Free</strong>
            <span>Start learning today</span>
          </p>
        </div>
      </section>
      <section className="home-section" id="how-it-works">
        <p className="eyebrow">How it works</p>
        <h2>A/L ICT එක ක්‍රමානුකූලව ඉගෙන ගන්න.</h2>
        <div className="steps-grid">
          <article>
            <span>01</span>
            <h3>Choose your medium</h3>
            <p>සිංහල හෝ English Medium track එක තෝරන්න.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Start with Free Chapters</h3>
            <p>ඔබගේ lesson flow එක අත්හදා බලන්න.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Progress with purpose</h3>
            <p>Published paid lessons later unlock through student access.</p>
          </article>
        </div>
      </section>
      <section className="home-section" id="about">
        <p className="eyebrow">Focused learning</p>
        <h2>A/L ICT සඳහාම ගොඩනැගූ learning platform එකක්.</h2>
        <p>
          Data, Information, Operating System, Database, Networking, Programming, Information
          Systems, Web Development සහ Internet of Things වැනි A/L ICT අන්තර්ගතයට අදාළ topics සඳහා
          පැහැදිලි path එකක්.
        </p>
        <Link className="text-link" to="/al-ict">
          Choose Sinhala or English Medium →
        </Link>
      </section>
    </>
  );
};
const CourseCard = ({ course }) => (
  <Card>
    <ResourceImage alt="" resourceId={course.thumbnailResourceId} />
    <h3>
      <Link to={`/courses/${course.slug}`}>{course.title}</Link>
    </h3>
    <p>{course.Subject?.name}</p>
    <p>{course.shortDescription}</p>
    <small>
      {course.academicLevel} · Grade {course.grade || '—'} · {course.medium}
    </small>
  </Card>
);
const ProductCard = ({ product }) => (
  <Card>
    <ResourceImage alt="" resourceId={product.thumbnailResourceId} />
    <h3>
      <Link to={`/store/products/${product.slug}`}>{product.name}</Link>
    </h3>
    <p>{product.shortDescription}</p>
    <strong>{formatCurrency(product.price, product.currency)}</strong>
    <p>
      <StatusBadge status={product.availability} />
    </p>
  </Card>
);

export const CoursesPage = () => {
  const [filters, setFilters] = useState({
    search: '',
    academicLevel: '',
    grade: '',
    medium: '',
    page: 1,
    limit: 12
  });
  const courses = useQuery({
    queryKey: queryKeys.content.courses(filters),
    queryFn: ({ signal }) =>
      contentApi.courses(
        Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '')),
        signal
      )
  });
  return (
    <>
      <h1>Courses</h1>
      <form
        className="filters"
        onSubmit={(event) => {
          event.preventDefault();
          setFilters((value) => ({ ...value, page: 1 }));
        }}
      >
        <label>
          Search
          <input
            onChange={(event) => setFilters((value) => ({ ...value, search: event.target.value }))}
            value={filters.search}
          />
        </label>
        <label>
          Level
          <select
            onChange={(event) =>
              setFilters((value) => ({ ...value, academicLevel: event.target.value }))
            }
            value={filters.academicLevel}
          >
            <option value="">All levels</option>
            <option value="ol">O/L</option>
            <option value="al">A/L</option>
            <option value="diploma">Diploma</option>
            <option value="skills">Skills</option>
          </select>
        </label>
        <label>
          Medium
          <select
            onChange={(event) => setFilters((value) => ({ ...value, medium: event.target.value }))}
            value={filters.medium}
          >
            <option value="">All media</option>
            <option value="sinhala">Sinhala</option>
            <option value="english">English</option>
            <option value="tamil">Tamil</option>
            <option value="mixed">Mixed</option>
          </select>
        </label>
        <button type="submit">Apply filters</button>
      </form>
      {courses.isLoading ? (
        <LoadingSkeleton />
      ) : courses.error ? (
        <PageError error={courses.error} />
      ) : dataItems(courses.data).length ? (
        <div className="grid">
          {dataItems(courses.data).map((course) => (
            <CourseCard course={course} key={course.id} />
          ))}
        </div>
      ) : (
        <EmptyState title="No courses match those filters" />
      )}
    </>
  );
};
export const CourseDetailPage = () => {
  const { courseSlug } = useParams();
  const course = useQuery({
    queryKey: queryKeys.content.course(courseSlug),
    queryFn: ({ signal }) => contentApi.course(courseSlug, signal)
  });
  if (course.isLoading) return <LoadingSkeleton />;
  if (course.error) return <PageError error={course.error} />;
  const item = course.data.data;
  return (
    <>
      <h1>{item.title}</h1>
      <p>{item.description || item.shortDescription}</p>
      <dl>
        <dt>Subject</dt>
        <dd>{item.Subject?.name}</dd>
        <dt>Duration</dt>
        <dd>
          {item.estimatedDurationHours ? `${item.estimatedDurationHours} hours` : 'Not specified'}
        </dd>
        <dt>Medium</dt>
        <dd>{item.medium}</dd>
      </dl>
      <Link className="button" to={`/courses/${item.id}/curriculum`}>
        View curriculum
      </Link>
      <h2>Curriculum summary</h2>
      {item.CourseModules?.map((module) => (
        <section className="module" key={module.id}>
          <h3>{module.title}</h3>
          <ul>
            {module.Lessons?.map((lesson) => (
              <li key={lesson.id}>
                {lesson.title}{' '}
                {lesson.isPreview && <Link to={`/lessons/${lesson.id}/preview`}>Preview</Link>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
};
export const CurriculumPage = () => {
  const { courseId } = useParams();
  const curriculum = useQuery({
    queryKey: queryKeys.content.curriculum(courseId),
    queryFn: ({ signal }) => contentApi.curriculum(courseId, signal)
  });
  if (curriculum.isLoading) return <LoadingSkeleton />;
  if (curriculum.error) return <PageError error={curriculum.error} />;
  const course = curriculum.data.data;
  return (
    <>
      <h1>{course.title} curriculum</h1>
      {course.CourseModules?.map((module) => (
        <section className="module" key={module.id}>
          <h2>{module.title}</h2>
          <ol>
            {module.Lessons?.map((lesson) => (
              <li key={lesson.id}>
                {lesson.title}{' '}
                {lesson.isPreview ? (
                  <Link to={`/lessons/${lesson.id}/preview`}>Open preview</Link>
                ) : (
                  <span>Protected lesson</span>
                )}
              </li>
            ))}
          </ol>
        </section>
      ))}
    </>
  );
};
const Section = ({ section }) => {
  const url = safeExternalUrl(section.externalUrl);
  const text = typeof section.content === 'string' ? section.content : '';
  if (section.sectionType === 'image')
    return <ResourceImage alt={section.title || 'Lesson image'} resourceId={section.resourceId} />;
  if (section.sectionType === 'download')
    return section.resourceId ? (
      <a href={resourceApi.publicContentUrl(section.resourceId)}>
        Download {section.title || 'resource'}
      </a>
    ) : null;
  if (['video', 'embed'].includes(section.sectionType))
    return url ? (
      <a href={url} rel="noreferrer" target="_blank">
        Open {section.title || 'external learning resource'}
      </a>
    ) : (
      <p>External content is unavailable.</p>
    );
  if (section.sectionType === 'heading') return <h2>{section.title || text}</h2>;
  return (
    <section className="lesson-section">
      <h2>{section.title}</h2>
      <p>{text}</p>
    </section>
  );
};
export const LessonPreviewPage = () => {
  const { lessonId } = useParams();
  const preview = useQuery({
    queryKey: queryKeys.content.preview(lessonId),
    queryFn: ({ signal }) => contentApi.preview(lessonId, signal)
  });
  if (preview.isLoading) return <LoadingSkeleton />;
  if (preview.error) return <PageError error={preview.error} />;
  const lesson = preview.data.data;
  return (
    <>
      <h1>{lesson.title}</h1>
      <p>{lesson.description}</p>
      {lesson.LessonSections?.map((section) => (
        <Section key={section.id} section={section} />
      ))}
    </>
  );
};

const credentialsSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.')
});
export const LoginPage = () => {
  const { startGoogleLogin } = useAuth();

  return (
    <section className="form-card">
      <p className="eyebrow">Student sign in</p>
      <h1>Continue your learning</h1>
      <p>Use your Google account to open your saved lessons and progress.</p>
      <button onClick={startGoogleLogin} type="button">
        Continue with Google
      </button>
    </section>
  );
};
const registrationSchema = credentialsSchema
  .extend({
    firstName: z.string().trim().min(1, 'First name is required.').max(120),
    lastName: z.string().trim().max(120).optional(),
    password: z
      .string()
      .min(8, 'Use at least 8 characters.')
      .regex(/[A-Za-z]/, 'Include a letter.')
      .regex(/\d/, 'Include a number.'),
    confirmPassword: z.string()
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.'
  });
export const RegisterPage = () => {
  const { register: registerAccount } = useAuth();
  const navigate = useNavigate();
  const form = useForm({ resolver: zodResolver(registrationSchema) });
  const mutation = useMutation({
    mutationFn: ({ confirmPassword: _confirmPassword, ...values }) => registerAccount(values),
    onSuccess: () => navigate('/student', { replace: true })
  });
  return (
    <section className="form-card">
      <h1>Create your student account</h1>
      <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <Field
          error={form.formState.errors.firstName}
          label="First name"
          name="firstName"
          register={form.register}
        />
        <Field
          error={form.formState.errors.lastName}
          label="Last name"
          name="lastName"
          register={form.register}
        />
        <Field
          error={form.formState.errors.email}
          label="Email"
          name="email"
          register={form.register}
          type="email"
        />
        <Field
          error={form.formState.errors.password}
          label="Password"
          name="password"
          register={form.register}
          type="password"
        />
        <Field
          error={form.formState.errors.confirmPassword}
          label="Confirm password"
          name="confirmPassword"
          register={form.register}
          type="password"
        />
        {mutation.error && <InlineError error={mutation.error} />}
        <button disabled={mutation.isPending} type="submit">
          {mutation.isPending ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </section>
  );
};

export const StorePage = () => {
  const [params, setParams] = useState({ search: '', productType: '', limit: 12 });
  const products = useQuery({
    queryKey: queryKeys.commerce.products(params),
    queryFn: ({ signal }) =>
      commerceApi.products(
        Object.fromEntries(Object.entries(params).filter(([, value]) => value !== '')),
        signal
      )
  });
  return (
    <>
      <h1>Learning packages</h1>
      <form className="filters">
        <label>
          Search
          <input
            onChange={(event) => setParams((value) => ({ ...value, search: event.target.value }))}
            value={params.search}
          />
        </label>
        <label>
          Type
          <select
            onChange={(event) =>
              setParams((value) => ({ ...value, productType: event.target.value }))
            }
            value={params.productType}
          >
            <option value="">All types</option>
            <option value="course_access">Course access</option>
            <option value="printed_tute">Printed tute</option>
            <option value="bundle">Bundle</option>
          </select>
        </label>
      </form>
      {products.isLoading ? (
        <LoadingSkeleton />
      ) : products.error ? (
        <PageError error={products.error} />
      ) : dataItems(products.data).length ? (
        <div className="grid">
          {dataItems(products.data).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState title="No products match those filters" />
      )}
    </>
  );
};
export const ProductDetailPage = () => {
  const { productSlug } = useParams();
  const { isAuthenticated } = useAuth();
  const { add } = useOrderSelection();
  const product = useQuery({
    queryKey: queryKeys.commerce.product(productSlug),
    queryFn: ({ signal }) => commerceApi.product(productSlug, signal)
  });
  if (product.isLoading) return <LoadingSkeleton />;
  if (product.error) return <PageError error={product.error} />;
  const item = product.data.data;
  const canOrder = ['available', 'low_stock', 'backorder'].includes(item.availability);
  return (
    <>
      <h1>{item.name}</h1>
      <ResourceImage alt={item.name} resourceId={item.thumbnailResourceId} />
      <p>{item.description || item.shortDescription}</p>
      <p>
        <strong>{formatCurrency(item.price, item.currency)}</strong>
        {item.compareAtPrice && <del>{formatCurrency(item.compareAtPrice, item.currency)}</del>}
      </p>
      <p>
        <StatusBadge status={item.availability} />
      </p>
      <h2>Included course access</h2>
      <ul>
        {item.entitlements?.map((entry) => (
          <li key={entry.courseId}>{entry.courseTitle}</li>
        ))}
      </ul>
      {!isAuthenticated ? (
        <Link className="button" to="/login">
          Sign in to order
        </Link>
      ) : canOrder ? (
        <button onClick={() => add(item)} type="button">
          Add to order
        </button>
      ) : (
        <p>This product is not currently available to order.</p>
      )}
    </>
  );
};

export const StudentDashboard = EnrollmentDashboard;
/*export const StudentDashboard = () => {
  const { user } = useAuth();

  return (
    <section className="member-dashboard">
      <p className="eyebrow">Member area</p>
      <h1>Welcome back, {user?.name || 'student'}.</h1>
      <p className="member-dashboard-intro">
        Pick up your next A/L ICT activity, browse free course content, or manage your lesson access.
      </p>
      <div className="member-action-grid">
        <Link to="/courses">
          <span aria-hidden="true">01</span>
          <strong>Continue learning</strong>
          <small>Open a course and resume the next lesson.</small>
        </Link>
        <Link to="/student/orders">
          <span aria-hidden="true">02</span>
          <strong>My lesson unlocks</strong>
          <small>Review orders and submit a payment when needed.</small>
        </Link>
        <Link to="/student/profile">
          <span aria-hidden="true">03</span>
          <strong>My profile</strong>
          <small>Check your account and sign-in settings.</small>
        </Link>
      </div>
    </section>
  );
};*/
export const StudentCoursesPage = () => {
  const enrolments = useQuery({
    queryKey: queryKeys.learning.enrolments(),
    queryFn: ({ signal }) => learningApi.enrolments({}, signal)
  });
  if (enrolments.isLoading) return <LoadingSkeleton />;
  if (enrolments.error) return <PageError error={enrolments.error} />;
  const items = enrolments.data.items || [];
  return (
    <>
      <h1>My courses</h1>
      {items.length ? (
        <div className="grid">
          {items.map((item) => (
            <Card key={item.id}>
              <h2>Course {item.courseId}</h2>
              <StatusBadge status={item.status} />
              <p>Enrolled {formatDate(item.enrolledAt)}</p>
              <Link to={`/student/courses/${item.courseId}/progress`}>View progress</Link>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="You do not have any enrolments yet">
          <Link to="/courses">Browse courses</Link>
        </EmptyState>
      )}
    </>
  );
};
export const ProgressPage = () => {
  const { courseId } = useParams();
  const progress = useQuery({
    queryKey: queryKeys.learning.progress(courseId),
    queryFn: ({ signal }) => learningApi.courseProgress(courseId, signal)
  });
  if (progress.isLoading) return <LoadingSkeleton />;
  if (progress.error) return <PageError error={progress.error} />;
  const item = progress.data;
  return (
    <>
      <h1>Course progress</h1>
      <p>{item.progressPercent ?? 0}% complete</p>
      <progress max="100" value={item.progressPercent || 0}>
        {item.progressPercent || 0}%
      </progress>
      <p>
        {item.completedLessons ?? 0} of {item.totalLessons ?? 0} lessons completed.
      </p>
    </>
  );
};
export const StudentLessonPage = () => {
  const { lessonId } = useParams();
  return (
    <>
      <h1>Lesson</h1>
      <p>
        Protected lesson content is not exposed by the current Content Service contract. If you have
        access, use the completion action after completing the lesson in the supplied learning
        material.
      </p>
      <LessonAction lessonId={lessonId} />
    </>
  );
};
const LessonAction = ({ lessonId }) => {
  const client = useQueryClient();
  const [courseId, setCourseId] = useState('');
  const [moduleId, setModuleId] = useState('');
  const mutation = useMutation({
    mutationFn: () => learningApi.complete(lessonId, { courseId, moduleId }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['learning'] })
  });
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate();
      }}
    >
      <label>
        Course ID
        <input onChange={(event) => setCourseId(event.target.value)} required value={courseId} />
      </label>
      <label>
        Module ID
        <input onChange={(event) => setModuleId(event.target.value)} required value={moduleId} />
      </label>
      {mutation.error && <InlineError error={mutation.error} />}
      <button disabled={mutation.isPending} type="submit">
        Mark lesson complete
      </button>
    </form>
  );
};
export const OrdersPage = () => {
  const orders = useQuery({
    queryKey: queryKeys.commerce.orders(),
    queryFn: ({ signal }) => commerceApi.orders({}, signal)
  });
  if (orders.isLoading) return <LoadingSkeleton />;
  if (orders.error) return <PageError error={orders.error} />;
  const items = dataItems(orders.data);
  return (
    <>
      <h1>My orders</h1>
      <Link className="button" to="/student/orders/new">
        Create an order
      </Link>
      {items.length ? (
        <ul className="list">
          {items.map((item) => (
            <li key={item.id}>
              <Link to={`/student/orders/${item.id}`}>{item.orderNumber || item.id}</Link>{' '}
              <StatusBadge status={item.status} /> {formatDate(item.createdAt)}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="No orders yet" />
      )}
    </>
  );
};
export const NewOrderPage = () => {
  const { items, update, remove, clear } = useOrderSelection();
  const client = useQueryClient();
  const navigate = useNavigate();
  const [deliveryMethod, setDeliveryMethod] = useState('none');
  const mutation = useMutation({
    mutationFn: () =>
      commerceApi.createOrder({
        items: items.map(({ productId, quantity }) => ({ productId, quantity })),
        deliveryMethod
      }),
    onSuccess: (result) => {
      clear();
      client.invalidateQueries({ queryKey: ['commerce', 'orders'] });
      navigate(`/student/orders/${result.data?.id || result.id}`);
    }
  });
  if (!items.length)
    return (
      <EmptyState title="Your order selection is empty">
        <Link to="/store">Browse learning packages</Link>
      </EmptyState>
    );
  return (
    <>
      <h1>Create order</h1>
      <ul className="list">
        {items.map((item) => (
          <li key={item.productId}>
            {item.name}
            <input
              aria-label={`Quantity for ${item.name}`}
              max="20"
              min="1"
              onChange={(event) => update(item.productId, event.target.value)}
              type="number"
              value={item.quantity}
            />
            <button onClick={() => remove(item.productId)} type="button">
              Remove
            </button>
          </li>
        ))}
      </ul>
      <label>
        Delivery method
        <select onChange={(event) => setDeliveryMethod(event.target.value)} value={deliveryMethod}>
          <option value="none">No delivery</option>
          <option value="pickup">Pickup</option>
          <option value="courier">Courier</option>
        </select>
      </label>
      {mutation.error && <InlineError error={mutation.error} />}
      <button disabled={mutation.isPending} onClick={() => mutation.mutate()} type="button">
        {mutation.isPending ? 'Creating…' : 'Create order'}
      </button>
    </>
  );
};
export const OrderDetailPage = () => {
  const { orderId } = useParams();
  const order = useQuery({
    queryKey: queryKeys.commerce.order(orderId),
    queryFn: ({ signal }) => commerceApi.order(orderId, signal)
  });
  if (order.isLoading) return <LoadingSkeleton />;
  if (order.error) return <PageError error={order.error} />;
  const item = order.data.data;
  return (
    <>
      <h1>Order {item.orderNumber || item.id}</h1>
      <StatusBadge status={item.status} />
      <p>Total: {formatCurrency(item.totalAmount, item.currency || 'LKR')}</p>
      <Link className="button" to={`/student/orders/${item.id}/payment`}>
        Submit bank transfer
      </Link>
    </>
  );
};
export const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(
      z.object({
        reference: z.string().trim().max(255).optional(),
        paymentSlip: z.any().refine((files) => files?.length === 1, 'Please attach your payment slip.')
      })
    )
  });
  const mutation = useMutation({
    mutationFn: (values) => {
      const body = new FormData();
      body.append('paymentSlip', values.paymentSlip[0]);
      if (values.reference) body.append('reference', values.reference);
      return commerceApi.submitBankTransfer(orderId, body);
    },
    onSuccess: () => navigate(`/student/orders/${orderId}`)
  });
  return (
    <section className="form-card">
      <h1>Submit bank transfer</h1>
      <p>Your payment will show as <strong>Payment under review</strong> until an administrator confirms it.</p>
      <p>Transfer the exact order amount to the bank account details supplied by A Plus ICT, then upload the receipt below.</p>
      <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <Field
          error={form.formState.errors.reference}
          label="Bank/reference number (optional)"
          name="reference"
          register={form.register}
        />
        <label>Payment slip<input accept="image/jpeg,image/png,image/webp,application/pdf" type="file" {...form.register('paymentSlip')} /></label>
        {form.formState.errors.paymentSlip ? <p className="field-error">{form.formState.errors.paymentSlip.message}</p> : null}
        <p>Accepted files: JPEG, PNG, WebP, or PDF. Keep the file within the upload limit.</p>
        {mutation.error && <InlineError error={mutation.error} />}
        <button disabled={mutation.isPending} type="submit">
          {mutation.isPending ? 'Uploading payment slip…' : 'Submit payment for review'}
        </button>
      </form>
    </section>
  );
};
export const ProfilePage = StudentProfilePage;
/*export const ProfilePage = () => {
  const { user, logoutAll } = useAuth();
  return (
    <section className="member-profile">
      <p className="eyebrow">My account</p>
      <h1>Profile and session</h1>
      <article>
        <h2>{user?.name || 'A Plus ICT student'}</h2>
        <p>{user?.email}</p>
        <p>Your student account uses Google sign-in. No password is stored in this Web app.</p>
      </article>
      <div className="member-profile-actions">
        <Link className="button" to="/logout">
          Log out on this device
        </Link>
        <button onClick={logoutAll} type="button">
          Log out on all devices
        </button>
      </div>
    </section>
  );
};*/

const PlannedPage = ({ title }) => (
  <>
    <h1>{title}</h1>
    <p>
      Management editor planned for the next phase. This page only exposes real list data where the
      current API supports it.
    </p>
  </>
);
export const TeacherDashboard = () => <TeacherCoursesPage />;
export const TeacherCoursesPage = () => {
  const tracks = useQuery({ queryKey: ['educator', 'tracks'], queryFn: educatorApi.tracks });
  if (tracks.isLoading) return <LoadingSkeleton />;
  if (tracks.error) return <PageError error={tracks.error} />;
  if (!tracks.data.length) return <EmptyState title="No course tracks have been assigned yet"><p>Ask an administrator to assign the course tracks you should manage.</p></EmptyState>;
  return <><p className="eyebrow">Educator workspace</p><h1>Assigned course tracks</h1><div className="grid">{tracks.data.map(({ assignmentId, capabilities, track }) => <Card key={assignmentId}><h2>{track?.title || 'Assigned course'}</h2><p>{track?.Course?.titleEn || track?.Course?.title}</p><p>{track?.Medium?.name || 'Course track'}</p><p>{Object.entries(capabilities).filter(([, allowed]) => allowed).map(([name]) => name.replace(/^canManage/, 'Manage ').replace('canGradeAssignments', 'Grade assignments').replace('canViewStudents', 'View students')).join(' · ') || 'View assigned content'}</p><Link to={`/teacher/courses/${track.id}`}>Open workspace</Link></Card>)}</div></>;
};
export const TeacherCoursePage = () => {
  const { trackId } = useParams(); const track = useQuery({ queryKey: ['educator', 'track', trackId], queryFn: () => educatorApi.track(trackId) });
  if (track.isLoading) return <LoadingSkeleton />;
  if (track.error) return <PageError error={track.error} />;
  return <><p className="eyebrow">Assigned course track</p><h1>{track.data.title}</h1><p>{track.data.Course?.titleEn || track.data.Course?.title}</p><p>Content, question, quiz, and grading tools will appear here as those modules are delivered. This workspace never exposes unassigned course tracks.</p><Link to="/teacher/courses">Back to assigned courses</Link></>;
};
export const TeacherContentPage = () => <PlannedPage title="My content" />;
export const AdminDashboard = () => <PlannedPage title="Administrator dashboard" />;
export const AdminListPage = () => <PlannedPage title="Management" />;
export const UnauthorizedPage = () => (
  <main className="page">
    <h1>Access denied</h1>
    <p>You do not have permission to view this page.</p>
    <Link to="/">Return home</Link>
  </main>
);
export const ServiceUnavailablePage = () => (
  <main className="page">
    <h1>Service unavailable</h1>
    <p>The requested service is not available right now. Please try again shortly.</p>
  </main>
);
export const NotFoundPage = () => (
  <main className="page">
    <h1>Page not found</h1>
    <p>The page you requested does not exist.</p>
    <Link to="/">Return home</Link>
  </main>
);
