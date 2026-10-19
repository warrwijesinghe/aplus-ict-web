import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, ChevronRight, CircleAlert, Clock3, CreditCard, Landmark, MessageCircle, ShieldCheck, Upload } from 'lucide-react';
import { commerceApi } from '../api/commerce.api.js';
import { contentApi } from '../api/content.api.js';
import { BrandLogo } from '../components/layout/BrandLogo.jsx';
import '../styles/full-lesson-access.css';
import { InlineError, LoadingSkeleton } from '../components/common/States.jsx';
import { launchPayHereCheckout } from '../features/store/payhere-checkout.js';

const price = (value) => `Rs. ${Number(value || 0).toLocaleString('en-LK', { maximumFractionDigits: 2 })}`;
const date = (value) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';
const fullLessonCopy = {
  english: {
    back: 'Back to lesson', lesson: 'LESSON', title: 'Unlock the complete lesson',
    intro: 'One purchase gives you the full learning experience for this lesson.',
    included: "What's included", label: 'FULL LESSON ACCESS', payment: 'One-time payment',
    duration: '2 years access', tutorial: 'Printed tutorial + home delivery', access: 'Access valid for 2 years',
    continue: 'Continue to payment', creating: 'Preparing your order…', secure: 'Secure payment via PayHere',
    free: 'Not ready yet? Your free preview stays available.', continueFree: 'Continue free learning',
    active: 'Your full lesson access is active.', learn: 'Continue learning',
    pending: 'Your order is waiting for payment confirmation.', viewOrder: 'View order',
    benefits: [
      ['Complete lesson access', 'All lesson activities and learning content.'],
      ['Exam-focused practice', 'Quizzes, exam-style practice and revision resources.'],
      ['Printed tutorial delivered home', 'Printed tutorial included with home delivery.'],
      ['2 years of access', 'Full lesson access for 2 years from the successful purchase date.']
    ]
  },
  sinhala: {
    back: 'පාඩමට ආපසු', lesson: 'පාඩම', title: 'සම්පූර්ණ පාඩම ලබා ගන්න',
    intro: 'එක් මිලදී ගැනීමකින් මෙම පාඩමේ සම්පූර්ණ ඉගෙනුම් අත්දැකීම ලබා ගන්න.',
    included: 'ඇතුළත් දේ', label: 'සම්පූර්ණ පාඩම් ප්‍රවේශය', payment: 'එක්වරක් පමණක් ගෙවන්න',
    duration: 'වසර 2ක ප්‍රවේශය', tutorial: 'මුද්‍රිත නිබන්ධනය සහ නිවසට බෙදාහැරීම', access: 'වසර 2ක් සඳහා ප්‍රවේශය',
    continue: 'ගෙවීමට ඉදිරියට යන්න', creating: 'ඇණවුම සකස් කරමින්…', secure: 'PayHere හරහා ආරක්ෂිත ගෙවීම්',
    free: 'තවම සූදානම් නැද්ද? නොමිලේ කොටස දිගටම ලබා ගත හැකිය.', continueFree: 'නොමිලේ ඉගෙනීම දිගටම කරගෙන යන්න',
    active: 'ඔබගේ සම්පූර්ණ පාඩම් ප්‍රවේශය සක්‍රීයයි.', learn: 'ඉගෙනීම දිගටම කරගෙන යන්න',
    pending: 'ඔබගේ ඇණවුමේ ගෙවීම තහවුරු කරන තෙක් රැඳී සිටින්න.', viewOrder: 'ඇණවුම බලන්න',
    benefits: [
      ['සම්පූර්ණ පාඩම් ප්‍රවේශය', 'පාඩමේ සියලු ක්‍රියාකාරකම් සහ ඉගෙනුම් අන්තර්ගතය.'],
      ['විභාග ඉලක්ක කරගත් පුහුණුව', 'ප්‍රශ්නාවලි, විභාග ආකාරයේ පුහුණුව සහ පුනරීක්ෂණ සම්පත්.'],
      ['මුද්‍රිත නිබන්ධනය නිවසටම', 'මුද්‍රිත නිබන්ධනය සහ නිවසට බෙදාහැරීම ඇතුළත්ය.'],
      ['වසර 2ක ප්‍රවේශය', 'සාර්ථක මිලදී ගැනීමේ දිනයේ සිට වසර 2ක් සඳහා සම්පූර්ණ පාඩම් ප්‍රවේශය.']
    ]
  }
};

export const ExamSuccessPackPage = () => {
  const { courseSlug, lessonSlug } = useParams();
  const navigate = useNavigate();
  const client = useQueryClient();
  const lesson = useQuery({ queryKey: ['commerce', 'lesson-context', courseSlug, lessonSlug], queryFn: ({ signal }) => contentApi.publicLesson(courseSlug, lessonSlug, signal) });
  const pack = useQuery({ queryKey: ['commerce', 'exam-success-pack', lesson.data?.data?.lesson?.id], queryFn: ({ signal }) => commerceApi.examSuccessPack(lesson.data.data.lesson.id, signal), enabled: Boolean(lesson.data?.data?.lesson?.id) });
  const create = useMutation({ mutationFn: () => commerceApi.createStudentOrder(pack.data.product.id), onSuccess: (result) => { client.invalidateQueries({ queryKey: ['commerce'] }); navigate(`/student/orders/${result.order.id}`); } });
  const context = lesson.data?.data;
  const isSinhala = context?.course?.medium?.code === 'sinhala';
  const copy = fullLessonCopy[isSinhala ? 'sinhala' : 'english'];
  const lessonPath = `/courses/${courseSlug}/lessons/${lessonSlug}`;
  const data = pack.data;
  const lessonNumber = context?.lesson?.lessonNumber ?? data?.lesson?.lessonNumber;
  const freeActivity = context?.lesson?.activities?.find((activity) => activity.accessPolicy === 'free');
  const freeLearningPath = freeActivity ? `${lessonPath}/activities/${freeActivity.id}` : `${lessonPath}/learn`;
  return <div className="full-lesson-page" lang={isSinhala ? 'si' : 'en'}>
    <header className="full-lesson-header">
      <Link aria-label="A Plus ICT home" to="/"><BrandLogo /></Link>
      <Link className="full-lesson-back" to={lessonPath}><span aria-hidden="true">←</span> {copy.back}</Link>
    </header>
    <main className="full-lesson-main">
      {lesson.isError || pack.isError ? <InlineError error={lesson.error || pack.error} onRetry={() => { lesson.refetch(); pack.refetch(); }} /> : lesson.isPending || pack.isPending ? <LoadingSkeleton label="Loading full lesson access" /> : <>
        <header className="full-lesson-intro">
          {lessonNumber != null && <p className="full-lesson-eyebrow">{copy.lesson} {String(lessonNumber).padStart(2, '0')}</p>}
          <h1>{context?.lesson?.title || data.lesson.title}</h1>
          <h2>{copy.title}</h2>
          <p className="full-lesson-description">{copy.intro}</p>
        </header>
        <div className="full-lesson-card">
          <section className="full-lesson-included" aria-labelledby="full-lesson-included-title">
            <h2 id="full-lesson-included-title">{copy.included}</h2>
            <ul>{copy.benefits.map(([title, description]) => <li key={title}><span className="full-lesson-check" aria-hidden="true">✓</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ul>
          </section>
          <section className="full-lesson-summary" aria-label={copy.label}>
            <p className="full-lesson-eyebrow">{copy.label}</p>
            <strong className="full-lesson-price">{price(data.product.price)}</strong>
            <p className="full-lesson-payment">{copy.payment}<span className="full-lesson-mobile-duration"> · {copy.duration}</span></p>
            <ul className="full-lesson-assurances"><li>✓ {copy.tutorial}</li><li>✓ {copy.access}</li></ul>
            {data.hasActiveEntitlement ? <div className="full-lesson-state"><p role="status">{copy.active}</p><Link className="button" to={`${lessonPath}/learn`}>{copy.learn}</Link></div> : data.pendingOrder ? <div className="full-lesson-state"><p role="status">{copy.pending}</p><Link className="button" to={`/student/orders/${data.pendingOrder.id}`}>{copy.viewOrder}</Link></div> : <>
              {create.error && <InlineError error={create.error} />}
              <button className="button" disabled={create.isPending} onClick={() => create.mutate()} type="button">{create.isPending ? copy.creating : copy.continue}<span aria-hidden="true">→</span></button>
            </>}
            <p className="full-lesson-secure">{copy.secure}</p>
          </section>
        </div>
        <div className="full-lesson-free"><p>{copy.free}</p><Link to={freeLearningPath}>{copy.continueFree}</Link></div>
      </>}
    </main>
  </div>;
};

export const StudentOrdersPage = () => {
  const location = useLocation();
  const orders = useQuery({ queryKey: ['commerce', 'student-orders'], queryFn: ({ signal }) => commerceApi.studentOrders({}, signal) });
  if (orders.isPending) return <LoadingSkeleton label="Loading orders" />; if (orders.isError) return <InlineError error={orders.error} onRetry={orders.refetch} />;
  const paymentCopy = (order) => {
    if (order.status === 'awaiting_payment') return { label: 'Receipt under review', note: 'We’re checking your payment receipt. You’ll get access once it is approved.', tone: 'review', action: 'View order details' };
    return ({
      verified: { label: 'Payment complete', note: 'Your lesson access is active.', tone: 'paid', action: 'View order details' },
      pending: { label: 'Payment pending', note: 'Complete the payment or upload your receipt to activate this lesson.', tone: 'pending', action: 'Continue payment' },
      failed: { label: 'Action required', note: 'Review your payment details and try again.', tone: 'failed', action: 'Fix payment' },
      refunded: { label: 'Refunded', note: 'This payment has been refunded.', tone: 'refunded', action: 'View order details' },
      unpaid: { label: 'Payment pending', note: 'Choose a payment method to activate this lesson.', tone: 'unpaid', action: 'Continue payment' },
    }[order.paymentStatus] || { label: 'Payment pending', note: 'Open this order to continue payment.', tone: 'pending', action: 'Continue payment' });
  };
  const paymentMethod = (order) => ({ bank_deposit: 'Bank deposit', bank_transfer: 'Online bank transfer', payhere: 'PayHere card payment' }[order.paymentMethod] || 'Payment method not selected');
  return <section className="student-orders-page"><div className="student-orders-heading"><div><p className="eyebrow">Purchases</p><h1>My orders</h1><p>View your lesson purchases, payment status and access.</p></div>{orders.data.items.length ? <span>{orders.data.items.length} {orders.data.items.length === 1 ? 'order' : 'orders'}</span> : null}</div>{location.state?.receiptSubmitted ? <div className="order-pending-notice" role="status"><CheckCircle2 aria-hidden="true" /><div><strong>Payment receipt sent</strong><p>Your receipt is under review. We will activate your lesson access after the payment is verified.</p></div></div> : (location.state?.bankDepositSubmitted || location.state?.bankTransferSubmitted) ? <div className="order-pending-notice" role="status"><CheckCircle2 aria-hidden="true" /><div><strong>Your order is saved</strong><p>Complete your payment using the account details provided. Then open this order to send your receipt on WhatsApp or attach it.</p></div></div> : null}{orders.data.items.length ? <div className="student-order-cards">{orders.data.items.map((order) => { const payment = paymentCopy(order); const product = order.items.map((item) => item.name).join(', '); const mediums = [...new Set(order.items.map((item) => item.medium?.name).filter(Boolean))]; const PaymentMethodIcon = ['bank_deposit', 'bank_transfer'].includes(order.paymentMethod) ? Landmark : CreditCard; const StatusIcon = payment.tone === 'paid' ? CheckCircle2 : payment.tone === 'failed' ? CircleAlert : Clock3; return <article className="student-order-card" key={order.id}><header className="student-order-card-top"><span className="student-order-mark">A+</span><div className="student-order-product"><p>Lesson purchase</p><h2>{product}</h2>{mediums.length > 0 && <div className="student-order-medium">{mediums.map((medium) => /medium$/i.test(medium) ? medium : `${medium} Medium`).join(' · ')}</div>}<span>Order #{order.orderNumber}</span></div></header><section className={`student-order-status-panel ${payment.tone}`}><StatusIcon aria-hidden="true" /><div><strong>{payment.label}</strong><p>{payment.note}</p></div></section><dl className="student-order-meta"><div><dt>Order date</dt><dd>{date(order.createdAt)}</dd></div><div><dt>Payment method</dt><dd className="student-order-payment-method"><span className="student-order-payment-icon"><PaymentMethodIcon aria-hidden="true" /></span><span>{paymentMethod(order)}</span></dd></div></dl><footer className="student-order-card-footer"><div className="student-order-total"><span>Total</span><strong>{price(order.total, order.currency)}</strong></div><Link className="student-order-open" to={`/student/orders/${order.id}`}>{payment.action} <ChevronRight aria-hidden="true" /></Link></footer></article>; })}</div> : <div className="student-orders-empty"><h2>No orders yet</h2><p>Lesson purchases you make will appear here.</p></div>}</section>;
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
  return <section className="order-detail"><Link to="/student/orders">← My orders</Link><p className="eyebrow">{item.paymentStatus === 'verified' ? 'Payment complete' : 'Payment pending'}</p><h1>Order {item.orderNumber}</h1><p><strong>{item.status.replaceAll('_', ' ')}</strong> · Payment {item.paymentStatus}</p><dl><dt>Product</dt><dd>{item.items.map((row) => row.name).join(', ')}</dd><dt>Amount</dt><dd>{price(item.total, item.currency)}</dd><dt>Created</dt><dd>{date(item.createdAt)}</dd><dt>Merchant</dt><dd>Miracle Network and Solutions (Pvt) Ltd</dd></dl>{payable ? <><button className="button" disabled={payHere.isPending} onClick={() => payHere.mutate()} type="button">{payHere.isPending ? 'Opening PayHere…' : 'Pay with PayHere'}</button><button disabled={cancel.isPending || payHere.isPending} onClick={() => { if (window.confirm('Cancel this unpaid order?')) cancel.mutate(); }} type="button">{cancel.isPending ? 'Cancelling…' : 'Cancel unpaid order'}</button></> : null}{(cancel.error || payHere.error) ? <InlineError error={cancel.error || payHere.error} /> : null}</section>;
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
    <Link className="checkout-back" to="/student/orders">← Back to my orders</Link>
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
          {paymentMethod === 'card' ? <section className="payment-option-content" aria-live="polite"><div className="payment-option-copy"><ShieldCheck aria-hidden="true" /><div><h3>Pay securely with PayHere</h3><p>You will be redirected to PayHere to enter your card details. A Plus ICT never sees or stores your card information.</p></div></div><button className="button checkout-primary" disabled={payHere.isPending} onClick={() => payHere.mutate()} type="button">{payHere.isPending ? 'Opening secure payment…' : <>Continue to PayHere <ChevronRight aria-hidden="true" /></>}</button></section> : <form className="bank-transfer-form" onSubmit={submitBankTransfer}><div className="bank-transfer-instructions"><Landmark aria-hidden="true" /><div><h3>Transfer the exact amount, then send us the receipt</h3><ol><li>Use the official A Plus ICT bank account details supplied in your payment instructions.</li><li>Include <strong>{item.orderNumber}</strong> in the transfer reference.</li><li>Upload a clear receipt so our team can verify your payment.</li></ol><p>Need bank account details? <Link to="/contact">Contact A Plus ICT support</Link>.</p></div></div><div className="checkout-field-grid"><label>Bank / transfer reference <span>Optional</span><input maxLength="255" onChange={(event) => setBankReference(event.target.value)} placeholder="e.g. bank reference number" value={bankReference} /></label><label>Payment receipt <strong>Required</strong><span className={`file-input ${paymentSlip ? 'has-file' : ''}`}><Upload aria-hidden="true" /><span>{paymentSlip ? paymentSlip.name : 'Choose receipt file'}</span><input accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => setPaymentSlip(event.target.files?.[0] ?? null)} required type="file" /></span><small>JPEG, PNG, WebP or PDF. Please ensure the transfer details are readable.</small></label></div><button className="button checkout-primary" disabled={!paymentSlip || bankTransfer.isPending} type="submit">{bankTransfer.isPending ? 'Submitting receipt…' : <>Submit payment for review <ChevronRight aria-hidden="true" /></>}</button></form>}
        </> : <section className="payment-complete-state"><CheckCircle2 aria-hidden="true" /><div><h2>{item.paymentStatus === 'verified' ? 'Your premium access is ready' : item.paymentMethod === 'bank_deposit' ? 'Your bank deposit order is pending' : 'Your bank transfer is being checked'}</h2><p>{item.paymentStatus === 'verified' ? 'You can return to your course and continue learning.' : item.paymentMethod === 'bank_deposit' ? 'Use the payment details sent to your phone when making your deposit. We will confirm your payment after review.' : 'We will notify you after the payment receipt has been verified. Please do not send another payment.'}</p>{item.paymentStatus === 'verified' ? <Link className="button" to="/student/courses">Go to my courses</Link> : null}</div></section>}
        {(cancel.error || payHere.error || bankTransfer.error) ? <InlineError error={cancel.error || payHere.error || bankTransfer.error} /> : null}
      </main>
      <aside className="checkout-order-summary"><p className="eyebrow">ORDER SUMMARY</p><h2>Your lesson</h2><div className="checkout-item"><span className="checkout-item-mark">A+</span><div><strong>{itemName}</strong><small>Premium lesson access</small></div></div><dl><div><dt>Lesson access</dt><dd>{price(item.total, item.currency)}</dd></div><div><dt>Delivery</dt><dd>Included</dd></div><div className="checkout-total"><dt>Total to pay</dt><dd>{price(item.total, item.currency)}</dd></div></dl><div className="checkout-assurance"><ShieldCheck aria-hidden="true" /><span>Secure payment · Access is activated after confirmation</span></div></aside>
    </div>
    {payable && paymentMethod !== 'bank-deposit' ? <button className="checkout-cancel" disabled={cancel.isPending || payHere.isPending || bankTransfer.isPending} onClick={() => { if (window.confirm('Cancel this unpaid order?')) cancel.mutate(); }} type="button">{cancel.isPending ? 'Cancelling order…' : 'Cancel this unpaid order'}</button> : null}
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
  useEffect(() => {
    if (order.data?.paymentStatus !== 'verified') return;
    client.invalidateQueries({ queryKey: ['student'] });
    client.invalidateQueries({ queryKey: ['learning'] });
    client.invalidateQueries({ queryKey: ['content', 'public'] });
  }, [client, order.data?.paymentStatus]);
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
    {!awaitingBankReview ? <Link className="checkout-back" to="/student/orders">← Back to my orders</Link> : null}
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
          <p className="payment-card-guidance">හැකි සෑම විටම කාඩ් පත් ගෙවීම් ක්‍රමය භාවිතා කරන්න.</p>
          <button className="button checkout-selection-continue" onClick={() => navigate(`/student/orders/${orderId}/payment/${paymentMethod}`)} type="button">{paymentActionLabel} <ChevronRight aria-hidden="true" /></button>
          </> : !isTransferReceiptStep ? <div className="checkout-payment-step"><p className="eyebrow">STEP 2 OF 2</p><h2>{checkoutMethod === 'card' ? 'Card payment' : checkoutMethod === 'bank-deposit' ? 'Bank deposit' : 'Online bank transfer'}</h2><button className="checkout-change-method" onClick={() => { setCardPaymentState('idle'); navigate(`/student/orders/${orderId}`); }} type="button">← Choose a different payment method</button></div> : null}
          {selectedPaymentMethod === 'card' ? <section className="payment-option-content" aria-live="polite"><div className="payment-option-copy"><ShieldCheck aria-hidden="true" /><div><h3>Pay securely with PayHere</h3><p>{cardPaymentState === 'confirming' ? 'Payment checkout completed. Confirming your payment...' : cardPaymentState === 'success' ? 'Payment successful. Your premium access is active.' : cardPaymentState === 'dismissed' ? 'Payment window closed. You can try again when ready.' : cardPaymentState === 'failed' ? 'Payment failed. You can try again.' : cardPaymentState === 'unverified' ? 'Unable to verify payment. Please check again shortly.' : 'PayHere securely handles your card details. A Plus ICT never sees or stores them.'}</p></div></div>{!['checkout', 'confirming'].includes(cardPaymentState) && cardPaymentState !== 'success' ? <><button className="button checkout-primary" disabled={payHere.isPending} onClick={() => payHere.mutate()} type="button">{payHere.isPending || cardPaymentState === 'processing' ? 'Opening PayHere...' : cardPaymentState === 'failed' || cardPaymentState === 'dismissed' ? 'Try payment again' : 'Pay Now'}</button><p className="checkout-policy-notice">By proceeding with payment, you agree to our <Link to="/terms-and-conditions">Terms &amp; Conditions</Link> and acknowledge our <Link to="/refund-policy">Refund Policy</Link> and <Link to="/privacy-policy">Privacy Policy</Link>.</p></> : null}{cardPaymentState === 'success' ? <Link className="button checkout-primary" to="/student/courses">Go to my courses</Link> : null}</section> : null}
          {selectedPaymentMethod && isBankPayment && !isTransferReceiptStep ? <section className="bank-payment-content" aria-live="polite">
            <div className="bank-payment-simple-intro"><Landmark aria-hidden="true" /><div><h3>{checkoutMethod === 'bank-deposit' ? 'Make a bank deposit' : 'Transfer through your banking app or internet banking'}</h3><p>{checkoutMethod === 'bank-deposit' ? 'Deposit the exact amount to any account below. Keep your receipt until payment is confirmed.' : `Use your order number ${item.orderNumber} as the transfer reference.`}</p></div></div>
            {checkoutMethod === 'bank-deposit' ? <p className="bank-account-choice">Select one or more bank accounts for your deposit. We will send each selected account's payment details to your phone.</p> : null}
            <div className="bank-account-list" aria-label="Bank account details">{bankAccounts.map((account) => { const selected = selectedBankAccountIds.includes(account.id); if (checkoutMethod !== 'bank-deposit') return <article className="bank-account-card bank-account-card-static" key={account.id}><img alt="" src={account.logo} /><span><strong>{account.bank}</strong><span>{account.branch}</span><p>{account.name}</p><code>{account.number}</code></span></article>; const toggle = () => setSelectedBankAccountIds((current) => selected ? current.filter((id) => id !== account.id) : [...current, account.id]); return <button aria-pressed={selected} className={`bank-account-card ${selected ? 'is-selected' : ''}`} key={account.id} onClick={toggle} type="button"><span className="bank-account-check" aria-hidden="true">{selected ? '✓' : ''}</span><img alt="" src={account.logo} /><span><strong>{account.bank}</strong><span>{account.branch}</span><p>{account.name}</p><code>{account.number}</code></span></button>; })}</div>
            {checkoutMethod === 'bank-deposit' ? <div className="bank-deposit-actions bank-deposit-sms-actions"><p>{selectedBankAccountIds.length ? `${selectedBankAccountIds.length} account${selectedBankAccountIds.length > 1 ? 's' : ''} selected. You will receive one clear payment-details SMS for each account.` : 'Choose at least one account before sending payment details.'}</p><button className="button" disabled={!selectedBankAccountIds.length || sendBankDepositDetails.isPending} onClick={() => sendBankDepositDetails.mutate()} type="button">{sendBankDepositDetails.isPending ? 'Sending payment details...' : 'Send Payment Details to Phone'}</button><button className="bank-deposit-cancel" disabled={cancel.isPending || sendBankDepositDetails.isPending} onClick={() => { if (window.confirm('Cancel this unpaid order?')) cancel.mutate(); }} type="button">{cancel.isPending ? 'Cancelling order...' : 'Cancel order'}</button>{sendBankDepositDetails.error ? <InlineError error={sendBankDepositDetails.error} /> : null}</div> : null}
            {checkoutMethod === 'bank-deposit' ? <div className="bank-deposit-actions"><p>Your order will be marked as payment pending. You can send your receipt later from My orders.</p><button className="button" disabled={bankDeposit.isPending} onClick={() => bankDeposit.mutate()} type="button">{bankDeposit.isPending ? 'Saving order…' : 'Continue to My orders'}</button><button className="bank-deposit-cancel" disabled={cancel.isPending || bankDeposit.isPending} onClick={() => { if (window.confirm('Cancel this unpaid order?')) cancel.mutate(); }} type="button">{cancel.isPending ? 'Cancelling order…' : 'Cancel order'}</button></div> : <div className="bank-deposit-actions"><p>After completing the transfer, attach your payment receipt in the next step.</p><button className="button" onClick={() => navigate(`/student/orders/${orderId}/payment/bank-transfer/receipt`)} type="button">I have made the transfer <ChevronRight aria-hidden="true" /></button><button className="bank-payment-later" disabled={bankTransferPending.isPending} onClick={() => bankTransferPending.mutate()} type="button">{bankTransferPending.isPending ? 'Saving order…' : 'Make transfer later — go to My orders'}</button></div>}
          </section> : null}
          {isTransferReceiptStep ? <section className="payment-complete-state payment-receipt-state"><CheckCircle2 aria-hidden="true" /><div><h2>Attach your payment receipt</h2><p>After your bank transfer, send the receipt on WhatsApp or attach it here.</p><div className="receipt-actions"><a className="receipt-message-button whatsapp" href={whatsappReceiptUrl} rel="noreferrer" target="_blank"><MessageCircle aria-hidden="true" /> Send receipt on WhatsApp</a></div><form className="bank-transfer-form" onSubmit={submitBankTransfer}><div className="checkout-field-grid"><label>Payment receipt<span className={`file-input ${paymentSlip ? 'has-file' : ''}`}><Upload aria-hidden="true" /><span>{paymentSlip ? paymentSlip.name : 'Attach receipt file'}</span><input accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => setPaymentSlip(event.target.files?.[0] ?? null)} type="file" /></span></label></div><button className="button checkout-primary" disabled={!paymentSlip || bankTransfer.isPending} type="submit">{bankTransfer.isPending ? 'Attaching receipt…' : 'Attach receipt'}</button></form></div></section> : null}
        </> : pendingBankPayment ? <section className="payment-complete-state payment-receipt-state"><CheckCircle2 aria-hidden="true" /><div><h2>Attach your payment receipt</h2><p>After your {item.paymentMethod === 'bank_deposit' ? 'bank deposit' : 'bank transfer'}, send the receipt on WhatsApp or attach it here.</p><div className="receipt-actions"><a className="receipt-message-button whatsapp" href={whatsappReceiptUrl} rel="noreferrer" target="_blank"><MessageCircle aria-hidden="true" /> Send receipt on WhatsApp</a></div><form className="bank-transfer-form" onSubmit={submitBankTransfer}><div className="checkout-field-grid"><label>Payment receipt<span className={`file-input ${paymentSlip ? 'has-file' : ''}`}><Upload aria-hidden="true" /><span>{paymentSlip ? paymentSlip.name : 'Attach receipt file'}</span><input accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => setPaymentSlip(event.target.files?.[0] ?? null)} type="file" /></span></label></div><button className="button checkout-primary" disabled={!paymentSlip || bankTransfer.isPending} type="submit">{bankTransfer.isPending ? 'Attaching receipt…' : 'Attach receipt'}</button></form></div></section> : <section className="payment-complete-state"><CheckCircle2 aria-hidden="true" /><div><h2>{item.paymentStatus === 'verified' ? 'Your premium access is ready' : 'Your payment is being checked'}</h2><p>{item.paymentStatus === 'verified' ? 'You can return to your course and continue learning.' : 'We will notify you after the payment receipt has been verified. Please do not send another payment.'}</p>{awaitingBankReview && uploadedSlip ? <div className="payment-review-actions"><button className="button secondary" disabled={viewSlip.isPending} onClick={() => viewSlip.mutate(uploadedSlip.id)} type="button">{viewSlip.isPending ? 'Opening receipt…' : 'View uploaded receipt'}</button><Link to="/student/orders">← Back to My orders</Link></div> : null}{item.paymentStatus === 'verified' ? <Link className="button" to="/student/courses">Go to my courses</Link> : null}</div></section>}
        {(bankDeposit.error || bankTransferPending.error || cancel.error || payHere.error || bankTransfer.error || viewSlip.error) ? <InlineError error={bankDeposit.error || bankTransferPending.error || cancel.error || payHere.error || bankTransfer.error || viewSlip.error} /> : null}
      </main>
      <aside className="checkout-order-summary"><p className="eyebrow">ORDER SUMMARY</p><h2>Your lesson</h2><div className="checkout-item"><span className="checkout-item-mark">A+</span><div><strong>{itemName}</strong><small>Premium lesson access</small></div></div><dl><div><dt>Lesson access</dt><dd>{price(item.total, item.currency)}</dd></div><div><dt>Delivery</dt><dd>Included</dd></div><div className="checkout-total"><dt>Total to pay</dt><dd>{price(item.total, item.currency)}</dd></div></dl><div className="checkout-assurance"><ShieldCheck aria-hidden="true" /><span>Secure payment · Access is activated after confirmation</span></div></aside>
    </div>
    {payable && !isBankPayment ? <button className="checkout-cancel" disabled={cancel.isPending || payHere.isPending || bankTransfer.isPending} onClick={() => { if (window.confirm('Cancel this unpaid order?')) cancel.mutate(); }} type="button">{cancel.isPending ? 'Cancelling order…' : 'Cancel this unpaid order'}</button> : null}
  </section>;
};
