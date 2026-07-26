export const InlineError = ({ error }) => (
  <p className="alert" role="alert">
    {error?.message || 'Something went wrong.'}
  </p>
);
export const EmptyState = ({ title = 'Nothing here yet', children }) => (
  <section className="empty">
    <h2>{title}</h2>
    {children}
  </section>
);
export const LoadingSkeleton = ({ label = 'Loading content' }) => (
  <p aria-live="polite" className="loading">
    {label}…
  </p>
);
export const StatusBadge = ({ status }) => (
  <span className="badge">{String(status || 'unknown').replaceAll('_', ' ')}</span>
);
