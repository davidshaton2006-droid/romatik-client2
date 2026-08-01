import React, { useEffect, useState } from 'react';
import { getImageUrl, isYandexDiskUrl, resolveYandexShareUrl } from '../utils/imageUtils';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string | undefined;
}

/**
 * Drop-in replacement for <img> that resolves Yandex Disk share links to a
 * fast, direct CDN URL via Yandex's own public API before rendering. Falls
 * back to the slow dokpub proxy only if that resolution fails.
 */
export const SmartImage: React.FC<SmartImageProps> = ({ src, className, style, ...rest }) => {
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(
    src && !isYandexDiskUrl(src) ? src : null
  );

  useEffect(() => {
    let cancelled = false;

    if (!src) {
      setResolvedSrc(null);
      return;
    }

    if (!isYandexDiskUrl(src)) {
      setResolvedSrc(src);
      return;
    }

    setResolvedSrc(null);
    resolveYandexShareUrl(src).then((href) => {
      if (cancelled) return;
      setResolvedSrc(href || getImageUrl(src));
    });

    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!resolvedSrc) {
    return <div className={`${className || ''} animate-pulse bg-[#4A3525]/10`} style={style} />;
  }

  return <img src={resolvedSrc} className={className} style={style} {...rest} />;
};
