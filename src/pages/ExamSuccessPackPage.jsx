import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { commerceApi } from '../api/commerce.api.js';
import { contentApi } from '../api/content.api.js';
import { InlineError, LoadingSkeleton } from '../components/common/States.jsx';

const price = (value, currency = 'LKR') => new Intl.NumberFormat('en-LK', { style: 'currency', currency }).format(Number(value || 0));
const date = (value) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';

export const ExamSuccessPackPage = () => {
  const { courseSlug, lessonSlug } = useParams(); const navigate = useNavigate(); const client = useQueryClient();
  const lesson = useQuery({ queryKey: ['commerce', 'lesson-context', courseSlug, lessonSlug], queryFn: ({ signal }) => contentApi.publicLesson(courseSlug, lessonSlug, signal) });
  const pack = useQuery({ queryKey: ['commerce', 'exam-success-pack', lesson.data?.data?.lesson?.id], queryFn: ({ signal }) => commerceApi.examSuccessPack(lesson.data.data.lesson.id, signal), enabled: Boolean(lesson.data?.data?.lesson?.id) });
  const create = useMutation({ mutationFn: () => commerceApi.createStudentOrder(pack.data.product.id), onSuccess: (result) => { client.invalidateQueries({ queryKey: ['commerce'] }); navigate(`/student/orders/${result.order.id}`); } });
  if (lesson.isPending || pack.isPending) return <LoadingSkeleton label="Loading Exam Success Pack" />;
  if (lesson.isError || pack.isError) return <InlineError error={lesson.error || pack.error} onRetry={() => { lesson.refetch(); pack.refetch(); }} />;
  const data = pack.data; const product = data.product;
  return <section className="exam-success-pack"><nav className="breadcrumbs"><Link to={`/courses/${courseSlug}/learn`}>My course</Link><span>/</span><Link to={`/courses/${courseSlug}/lessons/${lessonSlug}`}>{data.lesson.title}</Link><span>/</span><span>Exam Success Pack</span></nav><p className="eyebrow">Exam Success Pack</p><h1>{product.name}</h1><p>{product.shortDescription || product.description || `Premium practice and revision activities for ${data.lesson.title}.`}</p><div className="exam-pack-summary"><strong>{price(product.price, product.currency)}</strong><span>{data.includedPremiumActivityCount} premium activities included</span><span>{product.entitlementDurationDays ? `${product.entitlementDurationDays} days of access` : 'No automatic expiry'}</span></div>{data.hasActiveEntitlement ? <p className="success-message">Your Exam Success Pack is active. Premium activities in this Lesson are unlocked.</p> : data.pendingOrder ? <section className="payment-pending"><h2>Payment pending</h2><p>Order {data.pendingOrder.orderNumber} is waiting for payment confirmation.</p><Link className="button" to={`/student/orders/${data.pendingOrder.id}`}>View order</Link></section> : <><p>Creating an order reserves the server-calculated price.</p>{create.error ? <InlineError error={create.error} /> : null}<button className="button" disabled={create.isPending} onClick={() => create.mutate()} type="button">{create.isPending ? 'Creating order…' : 'Create order'}</button></>}</section>;
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
