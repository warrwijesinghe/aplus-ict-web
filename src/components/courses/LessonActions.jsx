import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingCart } from 'lucide-react';

export const LessonActions = ({ model, light = false }) => model.comingSoon ? <p className="sales-unavailable" role="status">{model.t("This lesson is coming soon.")}</p> : <div className={`sales-actions${light ? ' sales-actions-light' : ''}`}>
  <Link className="sales-button sales-button-primary" to={model.freeTo}>{model.freeLabel}<ArrowRight size={18} aria-hidden="true" /></Link>
  {model.canBuy && <Link className="sales-button sales-button-outline" to={model.buyTo}><ShoppingCart size={19} aria-hidden="true" />{model.t("Buy Full Lesson")}</Link>}
</div>;
