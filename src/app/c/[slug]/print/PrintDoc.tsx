'use client';

import { useEffect, useRef, useState } from 'react';

type SlideRef = { file: string; title?: string };

type Props = {
  slug: string;
  title: string;
  slides: SlideRef[];
};

export function PrintDoc({ slug, title, slides }: Props) {
  const [loaded, setLoaded] = useState(0);
  const total = slides.length;
  const printedRef = useRef(false);

  // Auto-trigger print once all iframes have loaded.
  useEffect(() => {
    if (loaded >= total && !printedRef.current) {
      printedRef.current = true;
      // Tiny delay so the browser settles layout
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
  }, [loaded, total]);

  const ready = loaded >= total;

  return (
    <div className="print-doc">
      <div className="print-toolbar print-screen-only">
        <div className="print-toolbar-left">
          <strong>{title}</strong>
          <span className="print-toolbar-meta">
            {total} {total === 1 ? 'slide' : 'slides'}
          </span>
        </div>
        <div className="print-toolbar-right">
          <span className="print-toolbar-status">
            {ready ? 'Ready to save as PDF' : `Loading slides… ${loaded}/${total}`}
          </span>
          <button
            type="button"
            className="print-toolbar-btn"
            onClick={() => window.print()}
            disabled={!ready}
          >
            Save as PDF
          </button>
        </div>
      </div>

      <div className="print-tip print-screen-only">
        Tip: in the print dialog, set destination to <strong>Save as PDF</strong>, layout to{' '}
        <strong>Landscape</strong>, and margins to <strong>None</strong> for a clean export.
      </div>

      <div className="print-pages">
        {slides.map((s, i) => (
          <section key={s.file} className="print-page" aria-label={`Slide ${i + 1}`}>
            <iframe
              src={`/c/${slug}/slides/${s.file}`}
              title={s.title ?? `Slide ${i + 1}`}
              width={1920}
              height={1080}
              onLoad={() => setLoaded((n) => n + 1)}
            />
          </section>
        ))}
      </div>
    </div>
  );
}
