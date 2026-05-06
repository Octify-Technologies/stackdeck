'use client';

import { useEffect, useState } from 'react';

import type { Image as ImageBlock } from '@/ir/schema';
import { assetIdFromSrc, getAssetUrl, isAssetSrc } from '@/storage/asset-store';

function parseAspect(ratio: string | undefined): string | undefined {
  if (!ratio) return undefined;
  const trimmed = ratio.trim();
  if (trimmed.includes('/')) return trimmed;
  if (trimmed.includes(':')) return trimmed.replace(':', ' / ');
  return undefined;
}

function useResolvedSrc(src: string): string {
  const [resolved, setResolved] = useState<string>(() => (isAssetSrc(src) ? '' : src));
  useEffect(() => {
    if (!isAssetSrc(src)) {
      setResolved(src);
      return;
    }
    const id = assetIdFromSrc(src);
    if (!id) return;
    let alive = true;
    void getAssetUrl(id).then((url) => {
      if (alive && url) setResolved(url);
    });
    return () => {
      alive = false;
    };
  }, [src]);
  return resolved;
}

export function Image({ block }: { block: ImageBlock }) {
  const treatment = block.treatment ?? 'plain';
  const aspect = parseAspect(block.aspectRatio);
  const focal = block.focal ?? '50% 50%';
  const resolvedSrc = useResolvedSrc(block.src);

  const figureStyle: React.CSSProperties = {};
  if (aspect) figureStyle.aspectRatio = aspect;

  const imgStyle: React.CSSProperties = { objectPosition: focal };

  return (
    <figure
      className="block block-image"
      data-treatment={treatment}
      data-has-caption={block.caption ? '' : undefined}
      style={figureStyle}
    >
      <div className="block-image__frame">
        {resolvedSrc ? (
          <img src={resolvedSrc} alt={block.alt ?? ''} style={imgStyle} loading="lazy" />
        ) : (
          <div className="block-image__placeholder" />
        )}
        {block.annotations?.length ? (
          <div className="block-image__annotations" aria-hidden="true">
            {block.annotations.map((a, i) => (
              <span
                key={i}
                className="block-image__annotation"
                style={{ left: a.x, top: a.y }}
                data-index={i + 1}
              >
                <span className="block-image__annotation-dot">{i + 1}</span>
                <span className="block-image__annotation-label">{a.label}</span>
              </span>
            ))}
          </div>
        ) : null}
      </div>
      {block.caption ? <figcaption>{block.caption}</figcaption> : null}
    </figure>
  );
}
