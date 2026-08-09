import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { commerceApi } from '../api/commerce.api.js';
import { contentApi } from '../api/content.api.js';
import { resourceApi } from '../api/resource.api.js';
import { InlineError, LoadingSkeleton } from '../components/common/States.jsx';

const price = (value) => `Rs. ${Number(value || 0).toLocaleString('en-LK', { maximumFractionDigits: 0 })}`;
const date = (value) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';
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
    eyebrow: 'PRINTED TUTORIAL · ගෙදරටම බෙදාහැරීම',
    title: 'ඔබේ පාඩමට සකස් කළ මුද්‍රිත tutorial එකක් ඇතුළත්',
    text: 'ගෙවීම තහවුරු වූ පසු, මෙම පාඩමේ tutorial එක ඔබගේ profile එකේ ලියාපදිංචි home address එකට බෙදා හරිනවා.',
    badge: 'HOME DELIVERY INCLUDED',
    placeholder: 'ඔබගේ පාඩමේ Tutorial Cover',
  } : {
    eyebrow: 'PRINTED TUTORIAL · HOME DELIVERY',
    title: 'A professionally printed tutorial is included',
    text: 'After payment is confirmed, the tutorial for this lesson is delivered to the home address saved in your student profile.',
    badge: 'HOME DELIVERY INCLUDED',
    placeholder: 'Your lesson tutorial cover',
  };
  const copy = isSinhala ? {
    myCourse: 'මගේ පාඩම්', pack: 'Premium පාඩම් ප්‍රවේශය', eyebrow: 'PREMIUM පාඩම් ප්‍රවේශය',
    accessTitle: 'සම්පූර්ණ පාඩම් Premium ප්‍රවේශය',
    intro: 'මෙය එක් activity එකක් සඳහා වන ගාස්තුවක් නොවේ. මෙම පාඩම සඳහා පළ කරන premium learning activities, quizzes සහ revision resources වෙත සම්පූර්ණ ප්‍රවේශය ලබා ගන්න.',
    priceLabel: 'සම්පූර්ණ පාඩම සඳහා මිල / Full lesson price',
    benefitsTitle: 'මෙම පාඩම සමඟ ලැබෙන Premium ප්‍රවේශය', benefits: [
      { icon: '01', title: 'Guided Premium ඉගෙනීම', description: 'මෙම පාඩමේ premium activities සහ ගැඹුරු පුහුණු කොටස් ඔබගේ වේගයට ඉගෙන ගන්න.' },
      { icon: '02', title: 'Exam-targeted පුහුණුව', description: 'මෙම පාඩම සඳහා පළ කරන premium quizzes සහ exam-style practice වෙත ප්‍රවේශය ලබා ගන්න.' },
      { icon: '03', title: 'Printed tute home delivery', description: 'මෙම පාඩමේ printed tute එක ඔබගේ student profile එකේ ලියාපදිංචි home address එකට ලබා දේ.', badge: 'ඇතුළත්', featured: true },
      { icon: '04', title: 'Revision resources', description: 'පසුව මෙම පාඩමට එකතු කරන premium revision resources ඔබගේ ප්‍රවේශයට ඇතුළත් වේ.' },
    ],
    activeTitle: 'ඔබගේ premium access සක්‍රීයයි', activeText: 'මෙම පාඩමේ premium activities දැන් විවෘත කර ඇත.',
    pendingTitle: 'ගෙවීම තහවුරු කිරීමට ඉතිරිව ඇත', pendingText: 'ඔබගේ order එක ගෙවීම තහවුරු වන තෙක් රැඳී ඇත.', viewOrder: 'Order එක බලන්න',
    notReady: 'දැන්ම unlock කිරීමට අවශ්‍ය නැද්ද?', freeText: 'නොමිලේ activities වලින් ආරම්භ කරන්න. ඔබ සූදානම් වූ විට premium activities සහ ගෙදරට බෙදා හරින printed tutorial එක ලබා ගන්න.',
    continueFree: 'නොමිලේ ඉගෙනීම ඉදිරියට ගෙනයන්න', checkoutNote: 'ගෙවීම තහවුරු වූ පසු ඔබේ printed tutorial එක home delivery සඳහා සූදානම් කෙරේ.', unlock: 'Premium unlock කරලා tutorial එක ලබාගන්න', creating: 'Order එක සකස් කරමින්…',
  } : {
    myCourse: 'My course', pack: 'Premium lesson access', eyebrow: 'PREMIUM LESSON ACCESS',
    accessTitle: 'Full lesson premium access',
    intro: 'This is not a charge for one activity. It gives you full access to the premium learning activities, quizzes, and revision resources published for this lesson.',
    priceLabel: 'Full lesson price',
    benefitsTitle: 'Your premium lesson experience', benefits: [
      { icon: '01', title: 'Guided premium learning', description: 'Work through the lesson’s premium activities and deeper practice at your own pace.' },
      { icon: '02', title: 'Exam-targeted practice', description: 'Access premium quizzes and exam-style practice published for this lesson.' },
      { icon: '03', title: 'Printed tute delivered home', description: 'A printed tute for this lesson will be delivered to the home address in your student profile.', badge: 'INCLUDED', featured: true },
      { icon: '04', title: 'Revision resources', description: 'Premium revision resources added to this lesson later are included with your access.' },
    ],
    activeTitle: 'Your premium access is active', activeText: 'Premium activities in this lesson are now unlocked.',
    pendingTitle: 'Payment confirmation pending', pendingText: 'Your order is waiting for payment confirmation.', viewOrder: 'View order',
    notReady: 'Not ready to unlock yet?', freeText: 'Start with the free activities. When you are ready, unlock the premium activities and receive the printed tutorial at home.',
    continueFree: 'Continue free learning', checkoutNote: 'After payment is confirmed, your printed tutorial is prepared for home delivery.', unlock: 'Unlock premium + get your tutorial', creating: 'Preparing your order…',
  };
  return <section className={`exam-success-pack ${isSinhala ? 'sinhala-medium' : 'english-medium'}`}>
    <nav aria-label="Breadcrumb" className="breadcrumbs"><Link to={`/courses/${courseSlug}/learn`}>{copy.myCourse}</Link><span>/</span><Link to={`/courses/${courseSlug}/lessons/${lessonSlug}`}>{data.lesson.title}</Link><span>/</span><span>{copy.pack}</span></nav>
    <div className="exam-pack-layout">
      <header className="exam-pack-intro"><div className="exam-pack-intro-copy"><p className="eyebrow">{copy.eyebrow}</p>{lessonNumber ? <div className="exam-pack-lesson-number">{isSinhala ? 'පාඩම' : 'Lesson'} {String(lessonNumber).padStart(2, '0')}</div> : null}<h1>{data.lesson.title}</h1><h2>{copy.accessTitle}</h2><p>{copy.intro}</p></div><section className="exam-pack-tutorial-inline"><div className="exam-pack-tutorial-copy"><p className="eyebrow">{tutorialCopy.eyebrow}</p><h3>{tutorialCopy.title}</h3><p>{tutorialCopy.text}</p><strong>{tutorialCopy.badge}</strong></div><figure><TutorialCover alt={`${data.lesson.title} tutorial cover`} fallbackSrc={tutorialFallbackSrc} placeholder={tutorialCopy.placeholder} resourceId={tutorialImageResourceId} /><figcaption>{isSinhala ? 'Printed tutorial' : 'Printed lesson tutorial'}</figcaption></figure></section></header>
      <aside className="exam-pack-purchase" aria-label={copy.pack}>
        <div className="exam-pack-price"><span>{copy.priceLabel}</span><strong>{price(product.price)}</strong></div>
        <div className="exam-pack-benefits"><h2>{copy.benefitsTitle}</h2><div>{copy.benefits.map((benefit) => <article className={benefit.featured ? 'featured' : ''} key={benefit.title}><span>{benefit.icon}</span><div><h3>{benefit.title}{benefit.badge ? <em>{benefit.badge}</em> : null}</h3><p>{benefit.description}</p></div></article>)}</div></div>
        {data.hasActiveEntitlement ? <div className="exam-pack-active"><strong>{copy.activeTitle}</strong><p>{copy.activeText}</p></div> : data.pendingOrder ? <div className="exam-pack-pending"><strong>{copy.pendingTitle}</strong><p>{copy.pendingText}</p><Link to={`/student/orders/${data.pendingOrder.id}`}>{copy.viewOrder}</Link></div> : <div className="exam-pack-actions"><p>{copy.checkoutNote}</p>{create.error ? <InlineError error={create.error} /> : null}<button className="button" disabled={create.isPending} onClick={() => create.mutate()} type="button">{create.isPending ? copy.creating : copy.unlock}</button></div>}
      </aside>
      <section className="exam-pack-free-path"><div><p className="eyebrow">{isSinhala ? 'නොමිලේ පාඩම්' : 'FREE LEARNING'}</p><h2>{copy.notReady}</h2><p>{copy.freeText}</p></div><Link className="button secondary" to={freeLearningPath}>{copy.continueFree}</Link></section>
    </div>
  </section>;
};

export const StudentOrdersPage = () => {
  const orders = useQuery({ queryKey: ['commerce', 'student-orders'], queryFn: ({ signal }) => commerceApi.studentOrders({}, signal) });
  if (orders.isPending) return <LoadingSkeleton label="Loading orders" />; if (orders.isError) return <InlineError error={orders.error} onRetry={orders.refetch} />;
  return <section><p className="eyebrow">Purchases</p><h1>My orders</h1>{orders.data.items.length ? <div className="resource-table-wrap"><table><thead><tr><th>Order</th><th>Product</th><th>Amount</th><th>Payment</th><th>Created</th></tr></thead><tbody>{orders.data.items.map((order) => <tr key={order.id}><td><Link to={`/student/orders/${order.id}`}>{order.orderNumber}</Link><small>{order.status}</small></td><td>{order.items.map((item) => item.name).join(', ')}</td><td>{price(order.total, order.currency)}</td><td>{order.paymentStatus}</td><td>{date(order.createdAt)}</td></tr>)}</tbody></table></div> : <p>You have no Exam Success Pack orders yet.</p>}</section>;
};

const submitCheckout = (checkout) => { const form = document.createElement('form'); form.method = checkout.method; form.action = checkout.action; Object.entries(checkout.fields).forEach(([name, value]) => { const field = document.createElement('input'); field.type = 'hidden'; field.name = name; field.value = value; form.appendChild(field); }); document.body.appendChild(form); form.submit(); };

export const StudentOrderDetailPage = () => {
  const { orderId } = useParams(); const client = useQueryClient(); const order = useQuery({ queryKey: ['commerce', 'student-order', orderId], queryFn: ({ signal }) => commerceApi.studentOrder(orderId, signal) });
  const cancel = useMutation({ mutationFn: () => commerceApi.cancelStudentOrder(orderId), onSuccess: () => { client.invalidateQueries({ queryKey: ['commerce'] }); order.refetch(); } });
  const directPay = useMutation({ mutationFn: () => commerceApi.initiateDirectPay(orderId), onSuccess: (result) => submitCheckout(result.checkout) });
  if (order.isPending) return <LoadingSkeleton label="Loading order" />; if (order.isError) return <InlineError error={order.error} onRetry={order.refetch} />;
  const item = order.data; const payable = ['pending', 'payment_pending', 'awaiting_payment'].includes(item.status) && ['unpaid', 'pending'].includes(item.paymentStatus);
  return <section className="order-detail"><Link to="/student/orders">← My orders</Link><p className="eyebrow">{item.paymentStatus === 'verified' ? 'Payment complete' : 'Payment pending'}</p><h1>Order {item.orderNumber}</h1><p><strong>{item.status.replaceAll('_', ' ')}</strong> · Payment {item.paymentStatus}</p><dl><dt>Product</dt><dd>{item.items.map((row) => row.name).join(', ')}</dd><dt>Amount</dt><dd>{price(item.total, item.currency)}</dd><dt>Created</dt><dd>{date(item.createdAt)}</dd><dt>Merchant</dt><dd>Miracle Network and Solutions (Pvt) Ltd</dd></dl>{payable ? <><button className="button" disabled={directPay.isPending} onClick={() => directPay.mutate()} type="button">{directPay.isPending ? 'Opening DirectPay…' : 'Pay with DirectPay'}</button><button disabled={cancel.isPending || directPay.isPending} onClick={() => { if (window.confirm('Cancel this unpaid order?')) cancel.mutate(); }} type="button">{cancel.isPending ? 'Cancelling…' : 'Cancel unpaid order'}</button></> : null}{(cancel.error || directPay.error) ? <InlineError error={cancel.error || directPay.error} /> : null}</section>;
};

export const DirectPayReturnPage = ({ cancelled = false }) => {
  const [search] = useSearchParams(); const orderId = search.get('orderId'); const status = useQuery({ queryKey: ['commerce', 'directpay-return', orderId], queryFn: () => commerceApi.paymentStatus(orderId, true), enabled: Boolean(orderId), refetchInterval: (query) => ['processing', 'customer_action_required', 'initiated'].includes(query.state.data?.status) ? 3000 : false });
  const data = status.data; const title = cancelled ? 'Payment was cancelled' : data?.status === 'completed' ? 'Payment verified' : data?.status === 'failed' ? 'Payment was not completed' : 'Payment is being verified';
  return <section className="order-detail"><p className="eyebrow">DirectPay</p><h1>{title}</h1><p>{data?.status === 'completed' ? 'Your premium access is now active.' : cancelled ? 'Your Order remains unpaid. You can try again when ready.' : 'We will only unlock content after the server verifies this payment.'}</p>{status.isError ? <InlineError error={status.error} /> : null}<Link className="button" to="/student/orders">Order history</Link>{orderId ? <Link to={`/student/orders/${orderId}`}>Return to order</Link> : null}</section>;
};
