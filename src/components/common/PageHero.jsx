import { ResourceImage } from '../resources/ResourceImage.jsx';

// All public landing and course heroes share their layout, gallery, and sizing.
export const PageHero = ({ titleId, children, images, galleryLabel = 'Students learning ICT online' }) => (
  <section aria-labelledby={titleId} className="public-hero academic-landing-hero shared-page-hero">
    <div className="academic-landing-hero-inner">
      <div className="public-hero-copy">{children}</div>
      <div aria-label={galleryLabel} className="public-hero-media academic-image-grid" role="group">
        {images.slice(0, 5).map((image, index) => {
          const className = 'academic-grid-image academic-grid-image-' + (index + 1);
          return image.resourceId ? <ResourceImage alt={image.alt} className={className} key={`${image.resourceId}-${index}`} resourceId={image.resourceId} /> : <img alt={image.alt} className={className} fetchPriority={index === 0 ? 'high' : undefined} height={index === 0 ? '810' : '600'} key={`${image.src}-${index}`} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/images/course-card-default.jpg'; }} loading={index === 0 ? 'eager' : 'lazy'} sizes="(min-width: 1024px) 24vw, (min-width: 768px) 30vw, 50vw" src={image.src} width={index === 0 ? '1440' : '800'} />;
        })}
      </div>
    </div>
  </section>
);
