import { ResourceImage } from '../resources/ResourceImage.jsx';

export const BrandLogo = ({ resourceId, brandName = 'A Plus ICT', className = '' }) => (
  <span className={`brand-logo ${className}`}>
    {resourceId ? (
      <ResourceImage alt="A Plus ICT" className="brand-logo-image" resourceId={resourceId} />
    ) : (
      <span aria-label="A Plus ICT" className="brand-logo-fallback" role="img">
        <strong>A+</strong>
        <span>Plus ICT</span>
      </span>
    )}
    <span className="sr-only">{brandName}</span>
  </span>
);
