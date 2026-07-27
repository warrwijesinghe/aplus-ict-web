import { useState } from 'react';
import { resourceApi } from '../../api/resource.api.js';
export const ResourceImage = ({ resourceId, alt = '', className = '', loading = 'lazy' }) => {
  const [failed, setFailed] = useState(false);
  if (!resourceId || failed)
    return (
      <div
        aria-label={alt || 'Image unavailable'}
        className={`image-fallback ${className}`}
        role="img"
      >
        Image unavailable
      </div>
    );
  return (
    <img
      alt={alt}
      className={className}
      loading={loading}
      onError={() => setFailed(true)}
      src={resourceApi.publicContentUrl(resourceId)}
    />
  );
};
