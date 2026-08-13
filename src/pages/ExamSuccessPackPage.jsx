import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, ChevronRight, CircleAlert, Clock3, CreditCard, Landmark, MessageCircle, ShieldCheck, Upload } from 'lucide-react';
import { commerceApi } from '../api/commerce.api.js';
import { contentApi } from '../api/content.api.js';
import { resourceApi } from '../api/resource.api.js';
import { InlineError, LoadingSkeleton } from '../components/common/States.jsx';
import { launchPayHereCheckout } from '../features/store/payhere-checkout.js';

const price = (value) => `Rs. ${Number(value || 0).toLocaleString('en-LK', { maximumFractionDigits: 0 })}`;
const date = (value) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'â€”';
const sampleTutorialCover = (isSinhala) => `${import.meta.env.BASE_URL}images/tutorial-covers/${isSinhala ? 'al-ict-sinhala-tutorial-book.png' : 'ol-ict-english-tutorial-book.png'}`;

const TutorialCover = ({ resourceId, fallbackSrc, alt, placeholder }) => {
  const [imageSrc, setImageSrc] = useState(fallbackSrc);
  useEffect(() => {
    let objectUrl;
    setImageSrc(fallbackSrc);
    if (!resourceId) return undefined;
    resourceApi.content(resourceId)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setImageSrc(objectUrl);
      })
      .catch(() => undefined);
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [fallbackSrc, resourceId]);
  return imageSrc
    ? <img alt={alt} src={imageSrc} />
    : <div aria-label={alt} className="exam-pack-tutorial-placeholder"><span>A+</span><strong>{placeholder}</strong></div>;
};

export const ExamSuccessPackPage = () => {
  const { courseSlug, lessonSlug } = useParams(); const navigate = useNavigate(); const client = useQueryClient();
  const lesson = useQuery({ queryKey: ['commerce', 'lesson-context', courseSlug, lessonSlug], queryFn: ({ signal }) => contentApi.publicLesson(courseSlug, lessonSlug, signal) });
  const pack = useQuery({ queryKey: ['commerce', 'exam-success-pack', lesson.data?.data?.lesson?.id], queryFn: ({ signal }) => commerceApi.examSuccessPack(lesson.data.data.lesson.id, signal), enabled: Boolean(lesson.data?.data?.lesson?.id) });
  const create = useMutation({ mutationFn: () => commerceApi.createStudentOrder(pack.data.product.id), onSuccess: (result) => { client.invalidateQueries({ queryKey: ['commerce'] }); navigate(`/student/orders/${result.order.id}`); } });
  if (lesson.isPending || pack.isPending) return <LoadingSkeleton label="Loading Exam Success Pack" />;
  if (lesson.isError || pack.isError) return <InlineError error={lesson.error || pack.error} onRetry={() => { lesson.refetch(); pack.refetch(); }} />;
  const data = pack.data; const product = data.product;
  const context = lesson.data?.data;
  const isSinhala = context?.course?.medium?.code === 'sinhala';
  const lessonNumber = context?.lesson?.lessonNumber ?? data.lesson?.lessonNumber;
  const tutorialImageResourceId = context?.lesson?.tutorialImageResourceId;
  const tutorialFallbackSrc = sampleTutorialCover(isSinhala);
  const freeActivity = context?.lesson?.activities?.find((activity) => activity.accessPolicy === 'free');
  const freeLearningPath = freeActivity ? `/courses/${courseSlug}/lessons/${lessonSlug}/activities/${freeActivity.id}` : `/courses/${courseSlug}/learn`;
  const tutorialCopy = isSinhala ? {
    eyebrow: 'PRINTED TUTORIAL Â· à¶œà·™à¶¯à¶»à¶§à¶¸ à¶¶à·™à¶¯à·à·„à·à¶»à·“à¶¸',
    title: 'à¶”à¶¶à·š à¶´à·à¶©à¶¸à¶§ à·ƒà¶šà·ƒà·Š à¶šà·… à¶¸à·”à¶¯à·Šâ€à¶»à·’à¶­ tutorial à¶‘à¶šà¶šà·Š à¶‡à¶­à·”à·…à¶­à·Š',
    text: 'à¶œà·™à·€à·“à¶¸ à¶­à·„à·€à·”à¶»à·” à·€à·– à¶´à·ƒà·”, à¶¸à·™à¶¸ à¶´à·à¶©à¶¸à·š tutorial à¶‘à¶š à¶”à¶¶à¶œà·š profile à¶‘à¶šà·š à¶½à·’à¶ºà·à¶´à¶¯à·’à¶‚à¶ à·’ home address à¶‘à¶šà¶§ à¶¶à·™à¶¯à· à·„à¶»à·’à¶±à·€à·.',
    badge: 'HOME DELIVERY INCLUDED',
    placeholder: 'à¶”à¶¶à¶œà·š à¶´à·à¶©à¶¸à·š Tutorial Cover',
  } : {
    eyebrow: 'PRINTED TUTORIAL Â· HOME DELIVERY',
    title: 'A professionally printed tutorial is included',
    text: 'After payment is confirmed, the tutorial for this lesson is delivered to the home address saved in your student profile.',
    badge: 'HOME DELIVERY INCLUDED',
    placeholder: 'Your lesson tutorial cover',
  };
  const copy = isSinhala ? {
    myCourse: 'à¶¸à¶œà·š à¶´à·à¶©à¶¸à·Š', pack: 'Premium à¶´à·à¶©à¶¸à·Š à¶´à·Šâ€à¶»à·€à·šà·à¶º', eyebrow: 'PREMIUM à¶´à·à¶©à¶¸à·Š à¶´à·Šâ€à¶»à·€à·šà·à¶º',
    accessTitle: 'à·ƒà¶¸à·Šà¶´à·–à¶»à·Šà¶« à¶´à·à¶©à¶¸à·Š Premium à¶´à·Šâ€à¶»à·€à·šà·à¶º',
    intro: 'à¶¸à·™à¶º à¶‘à¶šà·Š activity à¶‘à¶šà¶šà·Š à·ƒà¶³à·„à· à·€à¶± à¶œà·à·ƒà·Šà¶­à·”à·€à¶šà·Š à¶±à·œà·€à·š. à¶¸à·™à¶¸ à¶´à·à¶©à¶¸ à·ƒà¶³à·„à· à¶´à·… à¶šà¶»à¶± premium learning activities, quizzes à·ƒà·„ revision resources à·€à·™à¶­ à·ƒà¶¸à·Šà¶´à·–à¶»à·Šà¶« à¶´à·Šâ€à¶»à·€à·šà·à¶º à¶½à¶¶à· à¶œà¶±à·Šà¶±.',
    priceLabel: 'à·ƒà¶¸à·Šà¶´à·–à¶»à·Šà¶« à¶´à·à¶©à¶¸ à·ƒà¶³à·„à· à¶¸à·’à¶½ / Full lesson price',
    benefitsTitle: 'à¶¸à·™à¶¸ à¶´à·à¶©à¶¸ à·ƒà¶¸à¶Ÿ à¶½à·à¶¶à·™à¶± Premium à¶´à·Šâ€à¶»à·€à·šà·à¶º', benefits: [
      { icon: '01', title: 'Guided Premium à¶‰à¶œà·™à¶±à·“à¶¸', description: 'à¶¸à·™à¶¸ à¶´à·à¶©à¶¸à·š premium activities à·ƒà·„ à¶œà·à¶¹à·”à¶»à·” à¶´à·”à·„à·”à¶«à·” à¶šà·œà¶§à·ƒà·Š à¶”à¶¶à¶œà·š à·€à·šà¶œà¶ºà¶§ à¶‰à¶œà·™à¶± à¶œà¶±à·Šà¶±.' },
      { icon: '02', title: 'Exam-targeted à¶´à·”à·„à·”à¶«à·”à·€', description: 'à¶¸à·™à¶¸ à¶´à·à¶©à¶¸ à·ƒà¶³à·„à· à¶´à·… à¶šà¶»à¶± premium quizzes à·ƒà·„ exam-style practice à·€à·™à¶­ à¶´à·Šâ€à¶»à·€à·šà·à¶º à¶½à¶¶à· à¶œà¶±à·Šà¶±.' },
      { icon: '03', title: 'Printed tute home delivery', description: 'à¶¸à·™à¶¸ à¶´à·à¶©à¶¸à·š printed tute à¶‘à¶š à¶”à¶¶à¶œà·š student profile à¶‘à¶šà·š à¶½à·’à¶ºà·à¶´à¶¯à·’à¶‚à¶ à·’ home address à¶‘à¶šà¶§ à¶½à¶¶à· à¶¯à·š.', badge: 'à¶‡à¶­à·”à·…à¶­à·Š', featured: true },
      { icon: '04', title: 'Revision resources', description: 'à¶´à·ƒà·”à·€ à¶¸à·™à¶¸ à¶´à·à¶©à¶¸à¶§ à¶‘à¶šà¶­à·” à¶šà¶»à¶± premium revision resources à¶”à¶¶à¶œà·š à¶´à·Šâ€à¶»à·€à·šà·à¶ºà¶§ à¶‡à¶­à·”à·…à¶­à·Š à·€à·š.' },
    ],
    activeTitle: 'à¶”à¶¶à¶œà·š premium access à·ƒà¶šà·Šâ€à¶»à·“à¶ºà¶ºà·’', activeText: 'à¶¸à·™à¶¸ à¶´à·à¶©à¶¸à·š premium activities à¶¯à·à¶±à·Š à·€à·’à·€à·˜à¶­ à¶šà¶» à¶‡à¶­.',
    pendingTitle: 'à¶œà·™à·€à·“à¶¸ à¶­à·„à·€à·”à¶»à·” à¶šà·’à¶»à·“à¶¸à¶§ à¶‰à¶­à·’à¶»à·’à·€ à¶‡à¶­', pendingText: 'à¶”à¶¶à¶œà·š order à¶‘à¶š à¶œà·™à·€à·“à¶¸ à¶­à·„à·€à·”à¶»à·” à·€à¶± à¶­à·™à¶šà·Š à¶»à·à¶³à·“ à¶‡à¶­.', viewOrder: 'Order à¶‘à¶š à¶¶à¶½à¶±à·Šà¶±',
    notReady: 'à¶¯à·à¶±à·Šà¶¸ unlock à¶šà·’à¶»à·“à¶¸à¶§ à¶…à·€à·à·Šâ€à¶º à¶±à·à¶¯à·Šà¶¯?', freeText: 'à¶±à·œà¶¸à·’à¶½à·š activities à·€à¶½à·’à¶±à·Š à¶†à¶»à¶¸à·Šà¶· à¶šà¶»à¶±à·Šà¶±. à¶”à¶¶ à·ƒà·–à¶¯à·à¶±à¶¸à·Š à·€à·– à·€à·’à¶§ premium activities à·ƒà·„ à¶œà·™à¶¯à¶»à¶§ à¶¶à·™à¶¯à· à·„à¶»à·’à¶± printed tutorial à¶‘à¶š à¶½à¶¶à· à¶œà¶±à·Šà¶±.',
    continueFree: 'à¶±à·œà¶¸à·’à¶½à·š à¶‰à¶œà·™à¶±à·“à¶¸ à¶‰à¶¯à·’à¶»à·’à¶ºà¶§ à¶œà·™à¶±à¶ºà¶±à·Šà¶±', checkoutNote: 'à¶œà·™à·€à·“à¶¸ à¶­à·„à·€à·”à¶»à·” à·€à·– à¶´à·ƒà·” à¶”à¶¶à·š printed tutorial à¶‘à¶š home delivery à·ƒà¶³à·„à· à·ƒà·–à¶¯à·à¶±à¶¸à·Š à¶šà·™à¶»à·š.', unlock: 'Premium unlock à¶šà¶»à¶½à· tutorial à¶‘à¶š à¶½à¶¶à·à¶œà¶±à·Šà¶±', creating: 'Order à¶‘à¶š à·ƒà¶šà·ƒà·Š à¶šà¶»à¶¸à·’à¶±à·Šâ€¦',
  } : {
    myCourse: 'My course', pack: 'Premium lesson access', eyebrow: 'PREMIUM LESSON ACCESS',
    accessTitle: 'Full lesson premium access',
    intro: 'This is not a charge for one activity. It gives you full access to the premium learning activities, quizzes, and revision resources published for this lesson.',
    priceLabel: 'Full lesson price',
    benefitsTitle: 'Your premium lesson experience', benefits: [
      { icon: '01', title: 'Guided premium learning', description: 'Work through the lessonâ€™s premium activities and deeper practice at your own pace.' },
      { icon: '02', title: 'Exam-targeted practice', description: 'Access premium quizzes and exam-style practice published for this lesson.' },
      { icon: '03', title: 'Printed tute delivered home', description: 'A printed tute for this lesson will be delivered to the home address in your student profile.', badge: 'INCLUDED', featured: true },
      { icon: '04', title: 'Revision resources', description: 'Premium revision resources added to this lesson later are included with your access.' },
    ],
    activeTitle: 'Your premium access is active', activeText: 'Premium activities in this lesson are now unlocked.',
    pendingTitle: 'Payment confirmation pending', pendingText: 'Your order is waiting for payment confirmation.', viewOrder: 'View order',
    notReady: 'Not ready to unlock yet?', freeText: 'Start with the free activities. When you are ready, unlock the premium activities and receive the printed tutorial at home.',
    continueFree: 'Continue free learning', checkoutNote: 'After payment is confirmed, your printed tutorial is prepared for home delivery.', unlock: 'Unlock premium + get your tutorial', creating: 'Preparing your orderâ€¦',
  };
  return <section className={`exam-success-pack ${isSinhala ? 'sinhala-medium' : 'english-medium'}`}>
    <nav aria-label="Breadcrumb" className="breadcrumbs"><Link to={`/courses/${courseSlug}/learn`}>{copy.myCourse}</Link><span>/</span><Link to={`/courses/${courseSlug}/lessons/${lessonSlug}`}>{data.lesson.title}</Link><span>/</span><span>{copy.pack}</span></nav>
    <div className="exam-pack-layout">
      <header className="exam-pack-intro"><div className="exam-pack-intro-copy"><p className="eyebrow">{copy.eyebrow}</p>{lessonNumber ? <div className="exam-pack-lesson-number">{isSinhala ? 'à¶´à·à¶©à¶¸' : 'Lesson'} {String(lessonNumber).padStart(2, '0')}</div> : null}<h1>{data.lesson.title}</h1><h2>{copy.accessTitle}</h2><p>{copy.intro}</p></div><section className="exam-pack-tutorial-inline"><div className="exam-pack-tutorial-copy"><p className="eyebrow">{tutorialCopy.eyebrow}</p><h3>{tutorialCopy.title}</h3><p>{tutorialCopy.text}</p><strong>{tutorialCopy.badge}</strong></div><figure><TutorialCover alt={`${data.lesson.title} tutorial cover`} fallbackSrc={tutorialFallbackSrc} placeholder={tutorialCopy.placeholder} resourceId={tutorialImageResourceId} /><figcaption>{isSinhala ? 'Printed tutorial' : 'Printed lesson tutorial'}</figcaption></figure></section></header>
      <aside className="exam-pack-purchase" aria-label={copy.pack}>
        <div className="exam-pack-price"><span>{copy.priceLabel}</span><strong>{price(product.price)}</strong></div>
        <div className="exam-pack-benefits"><h2>{copy.benefitsTitle}</h2><div>{copy.benefits.map((benefit) => <article className={benefit.featured ? 'featured' : ''} key={benefit.title}><span>{benefit.icon}</span><div><h3>{benefit.title}{benefit.badge ? <em>{benefit.badge}</em> : null}</h3><p>{benefit.description}</p></div></article>)}</div></div>
        {data.hasActiveEntitlement ? <div className="exam-pack-active"><strong>{copy.activeTitle}</strong><p>{copy.activeText}</p></div> : data.pendingOrder ? <div className="exam-pack-pending"><strong>{copy.pendingTitle}</strong><p>{copy.pendingText}</p><Link to={`/student/orders/${data.pendingOrder.id}`}>{copy.viewOrder}</Link></div> : <div className="exam-pack-actions"><p>{copy.checkoutNote}</p>{create.error ? <InlineError error={create.error} /> : null}<button className="button" disabled={create.isPending} onClick={() => create.mutate()} type="button">{create.isPending ? copy.creating : copy.unlock}</button></div>}
      </aside>
      <section className="exam-pack-free-path"><div><p className="eyebrow">{isSinhala ? 'à¶±à·œà¶¸à·’à¶½à·š à¶´à·à¶©à¶¸à·Š' : 'FREE LEARNING'}</p><h2>{copy.notReady}</h2><p>{copy.freeText}</p></div><Link className="button secondary" to={freeLearningPath}>{copy.continueFree}</Link></section>
    </div>
  </section>;
};

export const StudentOrdersPage = () => {
  const location = useLocation();
  const orders = useQuery({ queryKey: ['commerce', 'student-orders'], queryFn: ({ signal }) => commerceApi.studentOrders({}, signal) });
  if (orders.isPending) return <LoadingSkeleton label="Loading orders" />; if (orders.isError) return <InlineError error={orders.error} onRetry={orders.refetch} />;
  const paymentCopy = (order) => {
    if (order.status === 'awaiting_payment') return { label: 'Receipt under review', note: 'Weâ€™re checking your payment receipt. Youâ€™ll get access once it is approved.', tone: 'review', action: 'View order details' };
    return ({
      verified: { label: 'Payment complete', note: 'Your lesson access is active.', tone: 'paid', action: 'View order details' },
      pending: { label: 'Payment pending', note: 'Complete the payment or upload your receipt to activate this lesson.', tone: 'pending', action: 'Continue payment' },
      failed: { label: 'Action required', note: 'Review your payment details and try again.', tone: 'failed', action: 'Fix payment' },
      refunded: { label: 'Refunded', note: 'This payment has been refunded.', tone: 'refunded', action: 'View order details' },
      unpaid: { label: 'Payment pending', note: 'Choose a payment method to activate this lesson.', tone: 'unpaid', action: 'Continue payment' },
    }[order.paymentStatus] || { label: 'Payment pending', note: 'Open this order to continue payment.', tone: 'pending', action: 'Continue payment' });
  };
  const paymentMethod = (order) => ({ bank_deposit: 'Bank deposit', bank_transfer: 'Online bank transfer', payhere: 'PayHere card payment' }[order.paymentMethod] || 'Payment method not selected');
  return <section className="student-orders-page"><div className="student-orders-heading"><div><p className="eyebrow">Purchases</p><h1>My orders</h1><p>View your lesson purchases, payment status and access.</p></div>{orders.data.items.length ? <span>{orders.data.items.length} {orders.data.items.length === 1 ? 'order' : 'orders'}</span> : null}</div>{location.state?.receiptSubmitted ? <div className="order-pending-notice" role="status"><CheckCircle2 aria-hidden="true" /><div><strong>Payment receipt sent</strong><p>Your receipt is under review. We will activate your lesson access after the payment is verified.</p></div></div> : (location.state?.bankDepositSubmitted || location.state?.bankTransferSubmitted) ? <div className="order-pending-notice" role="status"><CheckCircle2 aria-hidden="true" /><div><strong>Your order is saved</strong><p>Complete your payment using the account details provided. Then open this order to send your receipt on WhatsApp or attach it.</p></div></div> : null}{orders.data.items.length ? <div className="student-order-cards">{orders.data.items.map((order) => { const payment = paymentCopy(order); const product = order.items.map((item) => item.name).join(', '); const StatusIcon = payment.tone === 'paid' ? CheckCircle2 : payment.tone === 'failed' ? CircleAlert : Clock3; return <article className="student-order-card" key={order.id}><header className="student-order-card-top"><span className="student-order-mark">A+</span><div className="student-order-product"><p>Lesson purchase</p><h2>{product}</h2><span>Order #{order.orderNumber}</span></div></header><section className={`student-order-status-panel ${payment.tone}`}><StatusIcon aria-hidden="true" /><div><strong>{payment.label}</strong><p>{payment.note}</p></div></section><dl className="student-order-meta"><div><dt>Order date</dt><dd>{date(order.createdAt)}</dd></div><div><dt>Payment method</dt><dd>{paymentMethod(order)}</dd></div></dl><footer className="student-order-card-footer"><div className="student-order-total"><span>Total</span><strong>{price(order.total, order.currency)}</strong></div><Link className="student-order-open" to={`/student/orders/${order.id}`}>{payment.action} <ChevronRight aria-hidden="true" /></Link></footer></article>; })}</div> : <div className="student-orders-empty"><h2>No orders yet</h2><p>Lesson purchases you make will appear here.</p></div>}</section>;
};

const submitCheckout = (checkout) => launchPayHereCheckout(checkout);

const paymentSupportInternationalPhone = '94717105837';
const bankAccounts = [
  { id: 'nations-trust', bank: 'Nations Trust Bank', branch: 'Kuliyapitiya', logo: '/images/bank-logos/sampath.jpg', name: 'MIRACLE NETWORK AND SOLUTIONS (PVT) LTD', number: '200550052621' },
  { id: 'ndb', bank: 'NDB Bank', branch: 'Kuliyapitiya', logo: '/images/bank-logos/ndb.jfif', name: 'MIRACLE NETWORK AND SOLUTIONS (PVT) LTD', number: '111000370017' },
  { id: 'boc', bank: 'Bank of Ceylon (BOC)', branch: 'Kuliyapitiya', logo: '/images/bank-logos/boc.jpg', name: 'WARR WIJESINGHE', number: '86208871' },
  { id: 'sampath', bank: 'Sampath Bank', branch: 'Kuliyapitiya', logo: '/images/bank-logos/nations-trust.png', name: 'W. A. R. R. Wijesinghe', number: '1023 5303 9364' }
];

export const LegacyStudentOrderDetailPage = () => {
  const { orderId } = useParams(); const client = useQueryClient(); const order = useQuery({ queryKey: ['commerce', 'student-order', orderId], queryFn: ({ signal }) => commerceApi.studentOrder(orderId, signal) });
  const cancel = useMutation({ mutationFn: () => commerceApi.cancelStudentOrder(orderId), onSuccess: () => { client.invalidateQueries({ queryKey: ['commerce'] }); order.refetch(); } });
  const payHere = useMutation({ mutationFn: () => commerceApi.initiatePayHere(orderId), onSuccess: (result) => submitCheckout(result.checkout) });
  if (order.isPending) return <LoadingSkeleton label="Loading order" />; if (order.isError) return <InlineError error={order.error} onRetry={order.refetch} />;
  const item = order.data; const payable = ['pending', 'payment_pending', 'awaiting_payment'].includes(item.status) && ['unpaid', 'pending'].includes(item.paymentStatus);
  return <section className="order-detail"><Link to="/student/orders">â† My orders</Link><p className="eyebrow">{item.paymentStatus === 'verified' ? 'Payment complete' : 'Payment pending'}</p><h1>Order {item.orderNumber}</h1><p><strong>{item.status.replaceAll('_', ' ')}</strong> Â· Payment {item.paymentStatus}</p><dl><dt>Product</dt><dd>{item.items.map((row) => row.name).join(', ')}</dd><dt>Amount</dt><dd>{price(item.total, item.currency)}</dd><dt>Created</dt><dd>{date(item.createdAt)}</dd><dt>Merchant</dt><dd>Miracle Network and Solutions (Pvt) Ltd</dd></dl>{payable ? <><button className="button" disabled={payHere.isPending} onClick={() => payHere.mutate()} type="button">{payHere.isPending ? 'Opening PayHereâ€¦' : 'Pay with PayHere'}</button><button disabled={cancel.isPending || payHere.isPending} onClick={() => { if (window.confirm('Cancel this unpaid order?')) cancel.mutate(); }} type="button">{cancel.isPending ? 'Cancellingâ€¦' : 'Cancel unpaid order'}</button></> : null}{(cancel.error || payHere.error) ? <InlineError error={cancel.error || payHere.error} /> : null}</section>;
};

export const StudentOrderDetailPageWithUpload = () => {
  const { orderId } = useParams();
  const client = useQueryClient();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [bankReference, setBankReference] = useState('');
  const [paymentSlip, setPaymentSlip] = useState(null);
  const order = useQuery({ queryKey: ['commerce', 'student-order', orderId], queryFn: ({ signal }) => commerceApi.studentOrder(orderId, signal) });
  const cancel = useMutation({ mutationFn: () => commerceApi.cancelStudentOrder(orderId), onSuccess: () => { client.invalidateQueries({ queryKey: ['commerce'] }); order.refetch(); } });
  const payHere = useMutation({ mutationFn: () => commerceApi.initiatePayHere(orderId), onSuccess: (result) => submitCheckout(result.checkout) });
  const bankTransfer = useMutation({
    mutationFn: () => {
      const body = new FormData();
      body.append('paymentSlip', paymentSlip);
      return commerceApi.submitBankTransfer(orderId, body);
    },
    onSuccess: () => { client.invalidateQueries({ queryKey: ['commerce'] }); order.refetch(); }
  });
  if (order.isPending) return <LoadingSkeleton label="Loading order" />;
  if (order.isError) return <InlineError error={order.error} onRetry={order.refetch} />;

  const item = order.data;
  const awaitingBankReview = item.paymentMethod === 'bank_transfer' && item.paymentStatus === 'pending';
  const payable = ['pending', 'payment_pending', 'awaiting_payment'].includes(item.status) && item.paymentStatus === 'unpaid';
  const itemName = item.items.map((row) => row.name).join(', ');
  const submitBankTransfer = (event) => { event.preventDefault(); if (paymentSlip) bankTransfer.mutate(); };

  return <section className="lesson-checkout">
    <Link className="checkout-back" to="/student/orders">â† Back to my orders</Link>
    <div className="checkout-heading">
      <div><p className="eyebrow">{item.paymentStatus === 'verified' ? 'PAYMENT COMPLETE' : awaitingBankReview ? 'PAYMENT UNDER REVIEW' : 'SECURE CHECKOUT'}</p><h1>Complete your lesson purchase</h1><p>{item.paymentStatus === 'verified' ? 'Your premium lesson access is active.' : awaitingBankReview ? 'We have received your payment slip. Premium access will be activated after the transfer is verified.' : 'Choose a payment method to unlock premium learning for this lesson.'}</p></div>
      <span className={`checkout-status ${item.paymentStatus === 'verified' ? 'is-complete' : awaitingBankReview ? 'is-review' : ''}`}>{item.paymentStatus === 'verified' ? <CheckCircle2 aria-hidden="true" /> : <Clock3 aria-hidden="true" />}{item.paymentStatus === 'verified' ? 'Paid' : awaitingBankReview ? 'Under review' : 'Payment pending'}</span>
    </div>
    <div className="checkout-layout">
      <main className="checkout-payment-panel">
        {payable ? <>
          <div className="checkout-section-heading"><span>1</span><div><h2>Choose how you would like to pay</h2><p>Both options are secure. Your lesson unlocks only after payment is confirmed.</p></div></div>
          <div className="payment-methods" role="radiogroup" aria-label="Payment method">
            <button aria-checked={paymentMethod === 'card'} className={`payment-method payment-method-recommended ${paymentMethod === 'card' ? 'is-selected' : ''}`} onClick={() => setPaymentMethod('card')} role="radio" type="button"><span className="payment-method-icon"><CreditCard aria-hidden="true" /></span><span><strong>Credit or debit card <em>Recommended</em></strong><small>Pay online securely with PayHere</small></span><span className="payment-method-radio" aria-hidden="true" /></button>
            <button aria-checked={paymentMethod === 'bank'} className={`payment-method ${paymentMethod === 'bank' ? 'is-selected' : ''}`} onClick={() => setPaymentMethod('bank')} role="radio" type="button"><span className="payment-method-icon"><Landmark aria-hidden="true" /></span><span><strong>Bank deposit or online transfer</strong><small>Transfer, then upload your payment receipt</small></span><span className="payment-method-radio" aria-hidden="true" /></button>
          </div>
          {paymentMethod === 'card' ? <section className="payment-option-content" aria-live="polite"><div className="payment-option-copy"><ShieldCheck aria-hidden="true" /><div><h3>Pay securely with PayHere</h3><p>You will be redirected to PayHere to enter your card details. A Plus ICT never sees or stores your card information.</p></div></div><button className="button checkout-primary" disabled={payHere.isPending} onClick={() => payHere.mutate()} type="button">{payHere.isPending ? 'Opening secure paymentâ€¦' : <>Continue to PayHere <ChevronRight aria-hidden="true" /></>}</button></section> : <form className="bank-transfer-form" onSubmit={submitBankTransfer}><div className="bank-transfer-instructions"><Landmark aria-hidden="true" /><div><h3>Transfer the exact amount, then send us the receipt</h3><ol><li>Use the official A Plus ICT bank account details supplied in your payment instructions.</li><li>Include <strong>{item.orderNumber}</strong> in the transfer reference.</li><li>Upload a clear receipt so our team can verify your payment.</li></ol><p>Need bank account details? <Link to="/contact">Contact A Plus ICT support</Link>.</p></div></div><div className="checkout-field-grid"><label>Bank / transfer reference <span>Optional</span><input maxLength="255" onChange={(event) => setBankReference(event.target.value)} placeholder="e.g. bank reference number" value={bankReference} /></label><label>Payment receipt <strong>Required</strong><span className={`file-input ${paymentSlip ? 'has-file' : ''}`}><Upload aria-hidden="true" /><span>{paymentSlip ? paymentSlip.name : 'Choose receipt file'}</span><input accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => setPaymentSlip(event.target.files?.[0] ?? null)} required type="file" /></span><small>JPEG, PNG, WebP or PDF. Please ensure the transfer details are readable.</small></label></div><button className="button checkout-primary" disabled={!paymentSlip || bankTransfer.isPending} type="submit">{bankTransfer.isPending ? 'Submitting receiptâ€¦' : <>Submit payment for review <ChevronRight aria-hidden="true" /></>}</button></form>}
        </> : <section className="payment-complete-state"><CheckCircle2 aria-hidden="true" /><div><h2>{item.paymentStatus === 'verified' ? 'Your premium access is ready' : item.paymentMethod === 'bank_deposit' ? 'Your bank deposit order is pending' : 'Your bank transfer is being checked'}</h2><p>{item.paymentStatus === 'verified' ? 'You can return to your course and continue learning.' : item.paymentMethod === 'bank_deposit' ? 'Use the payment details sent to your phone when making your deposit. We will confirm your payment after review.' : 'We will notify you after the payment receipt has been verified. Please do not send another payment.'}</p>{item.paymentStatus === 'verified' ? <Link className="button" to="/student/courses">Go to my courses</Link> : null}</div></section>}
        {(cancel.error || payHere.error || bankTransfer.error) ? <InlineError error={cancel.error || payHere.error || bankTransfer.error} /> : null}
      </main>
      <aside className="checkout-order-summary"><p className="eyebrow">ORDER SUMMARY</p><h2>Your lesson</h2><div className="checkout-item"><span className="checkout-item-mark">A+</span><div><strong>{itemName}</strong><small>Premium lesson access</small></div></div><dl><div><dt>Lesson access</dt><dd>{price(item.total, item.currency)}</dd></div><div><dt>Delivery</dt><dd>Included</dd></div><div className="checkout-total"><dt>Total to pay</dt><dd>{price(item.total, item.currency)}</dd></div></dl><div className="checkout-assurance"><ShieldCheck aria-hidden="true" /><span>Secure payment Â· Access is activated after confirmation</span></div></aside>
    </div>
    {payable && paymentMethod !== 'bank-deposit' ? <button className="checkout-cancel" disabled={cancel.isPending || payHere.isPending || bankTransfer.isPending} onClick={() => { if (window.confirm('Cancel this unpaid order?')) cancel.mutate(); }} type="button">{cancel.isPending ? 'Cancelling orderâ€¦' : 'Cancel this unpaid order'}</button> : null}
  </section>;
};

export const StudentOrderDetailPage = () => {
  const { orderId, paymentMethod: routePaymentMethod, paymentStep } = useParams();
  const navigate = useNavigate();
  const client = useQueryClient();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [selectedBankAccountIds, setSelectedBankAccountIds] = useState([]);
  const [paymentSlip, setPaymentSlip] = useState(null);
  const [cardPaymentState, setCardPaymentState] = useState('idle');
  const order = useQuery({ queryKey: ['commerce', 'student-order', orderId], queryFn: ({ signal }) => commerceApi.studentOrder(orderId, signal) });
  const bankDeposit = useMutation({ mutationFn: () => commerceApi.submitStudentBankDeposit(orderId), onSuccess: () => { client.invalidateQueries({ queryKey: ['commerce'] }); navigate('/student/orders', { replace: true, state: { bankDepositSubmitted: true } }); } });
  const sendBankDepositDetails = useMutation({ mutationFn: () => commerceApi.sendStudentBankDepositPaymentDetails(orderId, selectedBankAccountIds), onSuccess: () => { client.invalidateQueries({ queryKey: ['commerce'] }); navigate('/student/orders', { replace: true, state: { bankDepositSubmitted: true } }); } });
  const bankTransferPending = useMutation({ mutationFn: () => commerceApi.submitStudentBankTransfer(orderId), onSuccess: () => { client.invalidateQueries({ queryKey: ['commerce'] }); navigate('/student/orders', { replace: true, state: { bankTransferSubmitted: true } }); } });
  const cancel = useMutation({ mutationFn: () => commerceApi.cancelStudentOrder(orderId), onSuccess: () => { client.invalidateQueries({ queryKey: ['commerce'] }); order.refetch(); } });
  const payHere = useMutation({
    mutationFn: async () => {
      setCardPaymentState('processing');
      const result = await commerceApi.initiatePayHere(orderId);
      await launchPayHereCheckout(result.checkout, {
        onCompleted: () => setCardPaymentState('confirming'),
        onDismissed: () => setCardPaymentState('dismissed'),
        onError: () => setCardPaymentState('failed'),
      });
      return result;
    },
    onSuccess: () => setCardPaymentState((state) => state === 'processing' ? 'checkout' : state),
    onError: () => setCardPaymentState('failed'),
  });
  const bankTransfer = useMutation({
    mutationFn: () => {
      const body = new FormData();
      body.append('paymentSlip', paymentSlip);
      return commerceApi.submitBankTransfer(orderId, body);
    },
    onSuccess: () => { client.invalidateQueries({ queryKey: ['commerce'] }); navigate('/student/orders', { replace: true, state: { receiptSubmitted: true } }); }
  });
  const viewSlip = useMutation({
    mutationFn: (paymentId) => commerceApi.paymentSlip(paymentId),
    onSuccess: (file) => {
      const url = URL.createObjectURL(file);
      window.open(url, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    }
  });
  useEffect(() => {
    if (cardPaymentState !== 'confirming') return undefined;
    let stopped = false;
    const poll = async () => {
      try {
        const result = await commerceApi.paymentStatus(orderId);
        if (stopped) return;
        if (result.status === 'completed') { setCardPaymentState('success'); client.invalidateQueries({ queryKey: ['commerce'] }); order.refetch(); }
        else if (['failed', 'cancelled', 'amount_mismatch'].includes(result.status)) setCardPaymentState('failed');
      } catch { if (!stopped) setCardPaymentState('unverified'); }
    };
    poll(); const interval = window.setInterval(poll, 3000);
    return () => { stopped = true; window.clearInterval(interval); };
  }, [cardPaymentState, client, order, orderId]);
  if (order.isPending) return <LoadingSkeleton label="Loading order" />;
  if (order.isError) return <InlineError error={order.error} onRetry={order.refetch} />;

  const item = order.data;
  const selectedPaymentMethod = ['card', 'bank-deposit', 'bank-transfer'].includes(routePaymentMethod) ? routePaymentMethod : null;
  const checkoutMethod = selectedPaymentMethod || paymentMethod;
  const isTransferReceiptStep = selectedPaymentMethod === 'bank-transfer' && paymentStep === 'receipt';
  const awaitingBankReview = item.paymentStatus === 'pending' && (item.status === 'awaiting_payment' || item.hasSubmittedPayment);
  const pendingBankPayment = ['bank_deposit', 'bank_transfer'].includes(item.paymentMethod) && item.paymentStatus === 'pending' && !item.hasSubmittedPayment && item.status !== 'awaiting_payment';
  const payable = ['pending', 'payment_pending', 'awaiting_payment'].includes(item.status) && item.paymentStatus === 'unpaid';
  const itemName = item.items.map((row) => row.name).join(', ');
  const uploadedSlip = item.payments?.find((payment) => payment.paymentSlipResourceId);
  const isBankPayment = checkoutMethod === 'bank-deposit' || checkoutMethod === 'bank-transfer';
  const bankPaymentLabel = checkoutMethod === 'bank-deposit' ? 'Bank deposit' : 'Online bank transfer';
  const paymentActionLabel = { card: 'Pay with card payment', 'bank-deposit': 'Pay by bank deposit', 'bank-transfer': 'Pay by bank transfer' }[paymentMethod];
  const receiptPaymentLabel = pendingBankPayment ? item.paymentMethod.replace('_', ' ') : bankPaymentLabel.toLowerCase();
  const receiptMessage = `Hello A Plus ICT, I made a ${receiptPaymentLabel} for Order ${item.orderNumber} (${price(item.total, item.currency)}). I will attach my payment receipt.`;
  const whatsappReceiptUrl = `https://wa.me/${paymentSupportInternationalPhone}?text=${encodeURIComponent(receiptMessage)}`;
  const submitBankTransfer = (event) => { event.preventDefault(); if (paymentSlip) bankTransfer.mutate(); };

  return <section className="lesson-checkout">
    {!awaitingBankReview ? <Link className="checkout-back" to="/student/orders">â† Back to my orders</Link> : null}
    <div className="checkout-heading">
      <div><p className="eyebrow">{item.paymentStatus === 'verified' ? 'PAYMENT COMPLETE' : awaitingBankReview ? 'PAYMENT UNDER REVIEW' : isTransferReceiptStep ? 'COMPLETE YOUR BANK TRANSFER' : 'SECURE CHECKOUT'}</p><h1>Complete your lesson purchase</h1><p>{item.paymentStatus === 'verified' ? 'Your premium lesson access is active.' : awaitingBankReview ? 'We have received your payment slip. Premium access will be activated after the transfer is verified.' : isTransferReceiptStep ? 'Attach your payment receipt to send it for review.' : 'Choose a payment method to unlock premium learning for this lesson.'}</p></div>
      <span className={`checkout-status ${item.paymentStatus === 'verified' ? 'is-complete' : awaitingBankReview ? 'is-review' : ''}`}>{item.paymentStatus === 'verified' ? <CheckCircle2 aria-hidden="true" /> : <Clock3 aria-hidden="true" />}{item.paymentStatus === 'verified' ? 'Paid' : awaitingBankReview ? 'Under review' : 'Payment pending'}</span>
    </div>
    <div className="checkout-layout">
      <main className="checkout-payment-panel">
        {payable ? <>
          {!selectedPaymentMethod ? <>
          <div className="checkout-section-heading"><span>1</span><div><h2>Choose how you would like to pay</h2><p>Both options are secure. Your lesson unlocks only after payment is confirmed.</p></div></div>
          <div className="payment-methods" role="radiogroup" aria-label="Payment method">
            <button aria-checked={paymentMethod === 'card'} className={`payment-method payment-method-recommended ${paymentMethod === 'card' ? 'is-selected' : ''}`} onClick={() => setPaymentMethod('card')} role="radio" type="button"><span className="payment-method-icon"><CreditCard aria-hidden="true" /></span><span><strong>Credit or debit card <em>Recommended</em></strong><small>Pay online securely with PayHere</small></span><span className="payment-method-radio" aria-hidden="true" /></button>
            <button aria-checked={paymentMethod === 'bank-deposit'} className={`payment-method ${paymentMethod === 'bank-deposit' ? 'is-selected' : ''}`} onClick={() => setPaymentMethod('bank-deposit')} role="radio" type="button"><span className="payment-method-icon"><Landmark aria-hidden="true" /></span><span><strong>Bank deposit</strong><small>Deposit at a branch or cash deposit machine</small></span><span className="payment-method-radio" aria-hidden="true" /></button>
            <button aria-checked={paymentMethod === 'bank-transfer'} className={`payment-method ${paymentMethod === 'bank-transfer' ? 'is-selected' : ''}`} onClick={() => setPaymentMethod('bank-transfer')} role="radio" type="button"><span className="payment-method-icon"><Landmark aria-hidden="true" /></span><span><strong>Online bank transfer</strong><small>Transfer through your banking app or internet banking</small></span><span className="payment-method-radio" aria-hidden="true" /></button>
          </div>
          <p className="payment-card-guidance">à·„à·à¶šà·’ à·ƒà·‘à¶¸ à·€à·’à¶§à¶¸ à¶šà·à¶©à·Š à¶´à¶­à·Š à¶œà·™à·€à·“à¶¸à·Š à¶šà·Šâ€à¶»à¶¸à¶º à¶·à·à·€à·’à¶­à· à¶šà¶»à¶±à·Šà¶±.</p>
          <button className="button checkout-selection-continue" onClick={() => navigate(`/student/orders/${orderId}/payment/${paymentMethod}`)} type="button">{paymentActionLabel} <ChevronRight aria-hidden="true" /></button>
          </> : !isTransferReceiptStep ? <div className="checkout-payment-step"><p className="eyebrow">STEP 2 OF 2</p><h2>{checkoutMethod === 'card' ? 'Card payment' : checkoutMethod === 'bank-deposit' ? 'Bank deposit' : 'Online bank transfer'}</h2><button className="checkout-change-method" onClick={() => { setCardPaymentState('idle'); navigate(`/student/orders/${orderId}`); }} type="button">â† Choose a different payment method</button></div> : null}
          {selectedPaymentMethod === 'card' ? <section className="payment-option-content" aria-live="polite"><div className="payment-option-copy"><ShieldCheck aria-hidden="true" /><div><h3>Pay securely with PayHere</h3><p>{cardPaymentState === 'confirming' ? 'Payment checkout completed. Confirming your payment...' : cardPaymentState === 'success' ? 'Payment successful. Your premium access is active.' : cardPaymentState === 'dismissed' ? 'Payment window closed. You can try again when ready.' : cardPaymentState === 'failed' ? 'Payment failed. You can try again.' : cardPaymentState === 'unverified' ? 'Unable to verify payment. Please check again shortly.' : 'PayHere securely handles your card details. A Plus ICT never sees or stores them.'}</p></div></div>{!['checkout', 'confirming'].includes(cardPaymentState) && cardPaymentState !== 'success' ? <><button className="button checkout-primary" disabled={payHere.isPending} onClick={() => payHere.mutate()} type="button">{payHere.isPending || cardPaymentState === 'processing' ? 'Opening PayHere...' : cardPaymentState === 'failed' || cardPaymentState === 'dismissed' ? 'Try payment again' : 'Pay Now'}</button><p className="checkout-policy-notice">By proceeding with payment, you agree to our <Link to="/terms-and-conditions">Terms &amp; Conditions</Link> and acknowledge our <Link to="/refund-policy">Refund Policy</Link> and <Link to="/privacy-policy">Privacy Policy</Link>.</p></> : null}{cardPaymentState === 'success' ? <Link className="button checkout-primary" to="/student/courses">Go to my courses</Link> : null}</section> : null}
          {selectedPaymentMethod && isBankPayment && !isTransferReceiptStep ? <section className="bank-payment-content" aria-live="polite">
            <div className="bank-payment-simple-intro"><Landmark aria-hidden="true" /><div><h3>{checkoutMethod === 'bank-deposit' ? 'Make a bank deposit' : 'Transfer through your banking app or internet banking'}</h3><p>{checkoutMethod === 'bank-deposit' ? 'Deposit the exact amount to any account below. Keep your receipt until payment is confirmed.' : `Use your order number ${item.orderNumber} as the transfer reference.`}</p></div></div>
            {checkoutMethod === 'bank-deposit' ? <p className="bank-account-choice">Select one or more bank accounts for your deposit. We will send each selected account's payment details to your phone.</p> : null}
            <div className="bank-account-list" aria-label="Bank account details">{bankAccounts.map((account) => { const selected = selectedBankAccountIds.includes(account.id); if (checkoutMethod !== 'bank-deposit') return <article className="bank-account-card bank-account-card-static" key={account.id}><img alt="" src={account.logo} /><span><strong>{account.bank}</strong><span>{account.branch}</span><p>{account.name}</p><code>{account.number}</code></span></article>; const toggle = () => setSelectedBankAccountIds((current) => selected ? current.filter((id) => id !== account.id) : [...current, account.id]); return <button aria-pressed={selected} className={`bank-account-card ${selected ? 'is-selected' : ''}`} key={account.id} onClick={toggle} type="button"><span className="bank-account-check" aria-hidden="true">{selected ? 'âœ“' : ''}</span><img alt="" src={account.logo} /><span><strong>{account.bank}</strong><span>{account.branch}</span><p>{account.name}</p><code>{account.number}</code></span></button>; })}</div>
            {checkoutMethod === 'bank-deposit' ? <div className="bank-deposit-actions bank-deposit-sms-actions"><p>{selectedBankAccountIds.length ? `${selectedBankAccountIds.length} account${selectedBankAccountIds.length > 1 ? 's' : ''} selected. You will receive one clear payment-details SMS for each account.` : 'Choose at least one account before sending payment details.'}</p><button className="button" disabled={!selectedBankAccountIds.length || sendBankDepositDetails.isPending} onClick={() => sendBankDepositDetails.mutate()} type="button">{sendBankDepositDetails.isPending ? 'Sending payment details...' : 'Send Payment Details to Phone'}</button><button className="bank-deposit-cancel" disabled={cancel.isPending || sendBankDepositDetails.isPending} onClick={() => { if (window.confirm('Cancel this unpaid order?')) cancel.mutate(); }} type="button">{cancel.isPending ? 'Cancelling order...' : 'Cancel order'}</button>{sendBankDepositDetails.error ? <InlineError error={sendBankDepositDetails.error} /> : null}</div> : null}
            {checkoutMethod === 'bank-deposit' ? <div className="bank-deposit-actions"><p>Your order will be marked as payment pending. You can send your receipt later from My orders.</p><button className="button" disabled={bankDeposit.isPending} onClick={() => bankDeposit.mutate()} type="button">{bankDeposit.isPending ? 'Saving orderâ€¦' : 'Continue to My orders'}</button><button className="bank-deposit-cancel" disabled={cancel.isPending || bankDeposit.isPending} onClick={() => { if (window.confirm('Cancel this unpaid order?')) cancel.mutate(); }} type="button">{cancel.isPending ? 'Cancelling orderâ€¦' : 'Cancel order'}</button></div> : <div className="bank-deposit-actions"><p>After completing the transfer, attach your payment receipt in the next step.</p><button className="button" onClick={() => navigate(`/student/orders/${orderId}/payment/bank-transfer/receipt`)} type="button">I have made the transfer <ChevronRight aria-hidden="true" /></button><button className="bank-payment-later" disabled={bankTransferPending.isPending} onClick={() => bankTransferPending.mutate()} type="button">{bankTransferPending.isPending ? 'Saving orderâ€¦' : 'Make transfer later â€” go to My orders'}</button></div>}
          </section> : null}
          {isTransferReceiptStep ? <section className="payment-complete-state payment-receipt-state"><CheckCircle2 aria-hidden="true" /><div><h2>Attach your payment receipt</h2><p>After your bank transfer, send the receipt on WhatsApp or attach it here.</p><div className="receipt-actions"><a className="receipt-message-button whatsapp" href={whatsappReceiptUrl} rel="noreferrer" target="_blank"><MessageCircle aria-hidden="true" /> Send receipt on WhatsApp</a></div><form className="bank-transfer-form" onSubmit={submitBankTransfer}><div className="checkout-field-grid"><label>Payment receipt<span className={`file-input ${paymentSlip ? 'has-file' : ''}`}><Upload aria-hidden="true" /><span>{paymentSlip ? paymentSlip.name : 'Attach receipt file'}</span><input accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => setPaymentSlip(event.target.files?.[0] ?? null)} type="file" /></span></label></div><button className="button checkout-primary" disabled={!paymentSlip || bankTransfer.isPending} type="submit">{bankTransfer.isPending ? 'Attaching receiptâ€¦' : 'Attach receipt'}</button></form></div></section> : null}
        </> : pendingBankPayment ? <section className="payment-complete-state payment-receipt-state"><CheckCircle2 aria-hidden="true" /><div><h2>Attach your payment receipt</h2><p>After your {item.paymentMethod === 'bank_deposit' ? 'bank deposit' : 'bank transfer'}, send the receipt on WhatsApp or attach it here.</p><div className="receipt-actions"><a className="receipt-message-button whatsapp" href={whatsappReceiptUrl} rel="noreferrer" target="_blank"><MessageCircle aria-hidden="true" /> Send receipt on WhatsApp</a></div><form className="bank-transfer-form" onSubmit={submitBankTransfer}><div className="checkout-field-grid"><label>Payment receipt<span className={`file-input ${paymentSlip ? 'has-file' : ''}`}><Upload aria-hidden="true" /><span>{paymentSlip ? paymentSlip.name : 'Attach receipt file'}</span><input accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => setPaymentSlip(event.target.files?.[0] ?? null)} type="file" /></span></label></div><button className="button checkout-primary" disabled={!paymentSlip || bankTransfer.isPending} type="submit">{bankTransfer.isPending ? 'Attaching receiptâ€¦' : 'Attach receipt'}</button></form></div></section> : <section className="payment-complete-state"><CheckCircle2 aria-hidden="true" /><div><h2>{item.paymentStatus === 'verified' ? 'Your premium access is ready' : 'Your payment is being checked'}</h2><p>{item.paymentStatus === 'verified' ? 'You can return to your course and continue learning.' : 'We will notify you after the payment receipt has been verified. Please do not send another payment.'}</p>{awaitingBankReview && uploadedSlip ? <div className="payment-review-actions"><button className="button secondary" disabled={viewSlip.isPending} onClick={() => viewSlip.mutate(uploadedSlip.id)} type="button">{viewSlip.isPending ? 'Opening receiptâ€¦' : 'View uploaded receipt'}</button><Link to="/student/orders">â† Back to My orders</Link></div> : null}{item.paymentStatus === 'verified' ? <Link className="button" to="/student/courses">Go to my courses</Link> : null}</div></section>}
        {(bankDeposit.error || bankTransferPending.error || cancel.error || payHere.error || bankTransfer.error || viewSlip.error) ? <InlineError error={bankDeposit.error || bankTransferPending.error || cancel.error || payHere.error || bankTransfer.error || viewSlip.error} /> : null}
      </main>
      <aside className="checkout-order-summary"><p className="eyebrow">ORDER SUMMARY</p><h2>Your lesson</h2><div className="checkout-item"><span className="checkout-item-mark">A+</span><div><strong>{itemName}</strong><small>Premium lesson access</small></div></div><dl><div><dt>Lesson access</dt><dd>{price(item.total, item.currency)}</dd></div><div><dt>Delivery</dt><dd>Included</dd></div><div className="checkout-total"><dt>Total to pay</dt><dd>{price(item.total, item.currency)}</dd></div></dl><div className="checkout-assurance"><ShieldCheck aria-hidden="true" /><span>Secure payment Â· Access is activated after confirmation</span></div></aside>
    </div>
    {payable && !isBankPayment ? <button className="checkout-cancel" disabled={cancel.isPending || payHere.isPending || bankTransfer.isPending} onClick={() => { if (window.confirm('Cancel this unpaid order?')) cancel.mutate(); }} type="button">{cancel.isPending ? 'Cancelling orderâ€¦' : 'Cancel this unpaid order'}</button> : null}
  </section>;
};
