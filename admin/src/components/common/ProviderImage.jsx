import { useEffect, useState } from 'react';
import { resolveImageUrl } from '../../api/http.js';

const ProviderImage = ({ src, alt, className = 'provider-image', emptyLabel = '' }) => {
  const resolved = resolveImageUrl(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [resolved]);

  if (!resolved || failed) {
    return (
      <div className={`${className} provider-image--empty`} aria-hidden="true">
        {emptyLabel}
      </div>
    );
  }

  return (
    <a href={resolved} target="_blank" rel="noreferrer" className="provider-image-link">
      <img
        src={resolved}
        alt={alt}
        className={className}
        onError={() => setFailed(true)}
      />
    </a>
  );
};

export default ProviderImage;
