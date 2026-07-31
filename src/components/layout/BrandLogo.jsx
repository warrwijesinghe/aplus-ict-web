// Use the shared local brand mark until optional API-managed site-profile assets exist.
export const BrandLogo = ({ brandName = 'A Plus ICT', className = '', variant = 'default' }) => (
  <span className={`brand-logo ${className}`}>
    <img
      alt="A Plus ICT"
      className="brand-logo-image"
      src={variant === 'light' ? '/images/aplus-ict-logo-light.png' : '/images/aplus-ict-logo.png'}
    />
    <span className="sr-only">{brandName}</span>
  </span>
);
