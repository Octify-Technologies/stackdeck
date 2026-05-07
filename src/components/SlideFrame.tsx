'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export const CANVAS_W = 1920;
export const CANVAS_H = 1080;

type Props = {
  src: string;
  title?: string;
  /** When false, defer src assignment until in view (for thumbnails). */
  lazy?: boolean;
  /** When false, do not run scripts inside the slide. */
  interactive?: boolean;
  /** Show a subtle loading bar while the iframe loads. */
  showLoader?: boolean;
  className?: string;
};

export function SlideFrame({
  src,
  title,
  lazy = false,
  interactive = true,
  showLoader = false,
  className,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(1);
  const [visible, setVisible] = useState(!lazy);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      const s = Math.min(r.width / CANVAS_W, r.height / CANVAS_H);
      setScale(s > 0 ? s : 1);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!lazy) return;
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: '200px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [lazy]);

  // Reset loading state when src changes
  useEffect(() => {
    setLoading(true);
  }, [src]);

  const sandbox = interactive ? 'allow-scripts allow-same-origin' : '';
  const wrapClass = interactive ? 'slide-wrap' : 'slide-wrap slide-wrap-passive';

  return (
    <div ref={wrapRef} className={`${wrapClass} ${className ?? ''}`}>
      {showLoader && loading ? <div className="slide-loader" aria-hidden /> : null}
      <div
        className="slide-canvas"
        style={{
          width: CANVAS_W,
          height: CANVAS_H,
          transform: `scale(${scale})`,
        }}
      >
        {visible ? (
          <iframe
            ref={iframeRef}
            src={src}
            title={title ?? 'slide'}
            width={CANVAS_W}
            height={CANVAS_H}
            sandbox={sandbox}
            loading={lazy ? 'lazy' : 'eager'}
            tabIndex={-1}
            onLoad={() => setLoading(false)}
          />
        ) : null}
      </div>
    </div>
  );
}
