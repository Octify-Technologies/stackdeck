'use client';

import { useEffect, useRef, useState } from 'react';

type WatermarkMode = 'none' | 'draft' | 'confidential' | 'review' | 'internal';

const OPTIONS: { value: WatermarkMode; label: string }[] = [
  { value: 'none', label: 'No watermark' },
  { value: 'draft', label: 'DRAFT' },
  { value: 'confidential', label: 'CONFIDENTIAL' },
  { value: 'review', label: 'FOR REVIEW' },
  { value: 'internal', label: 'INTERNAL ONLY' },
];

export function ExportPdf({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const exportWith = (mode: WatermarkMode) => {
    setOpen(false);
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    if (mode !== 'none') {
      const label = OPTIONS.find((o) => o.value === mode)?.label ?? mode.toUpperCase();
      root.setAttribute('data-watermark', mode);
      root.style.setProperty('--watermark-text', `'${label}'`);
    } else {
      root.removeAttribute('data-watermark');
      root.style.removeProperty('--watermark-text');
    }
    setTimeout(() => {
      window.print();
      window.setTimeout(() => {
        root.removeAttribute('data-watermark');
        root.style.removeProperty('--watermark-text');
      }, 250);
    }, 16);
  };

  return (
    <div className="export-pdf" ref={wrapRef}>
      <button
        type="button"
        className={className}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Export deck as PDF"
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
          <path
            d="M6.5 1.5V8.5M6.5 8.5L3.5 5.5M6.5 8.5L9.5 5.5M2 10.5V11.5H11V10.5"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>Export PDF</span>
      </button>
      {open ? (
        <ul className="export-pdf__menu" role="menu">
          {OPTIONS.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                role="menuitem"
                className="export-pdf__item"
                onClick={() => exportWith(opt.value)}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
