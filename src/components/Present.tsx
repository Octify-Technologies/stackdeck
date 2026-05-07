'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SlideFrame } from './SlideFrame';
import { StackdeckMark } from './StackdeckMark';
import './SlideFrame.css';
import './Present.css';

type SlideRef = { file: string; title?: string };

type Props = {
  slug: string;
  title: string;
  slides: SlideRef[];
  initialIndex: number;
  onIndexChange?: (i: number) => void;
  onExit: () => void;
};

export function Present({ slug, title, slides, initialIndex, onIndexChange, onExit }: Props) {
  const [index, setIndex] = useState(() => Math.max(0, Math.min(initialIndex, slides.length - 1)));
  const [chromeVisible, setChromeVisible] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const total = slides.length;

  const updateIndex = useCallback(
    (next: number | ((i: number) => number)) => {
      setIndex((prev) => {
        const n = typeof next === 'function' ? next(prev) : next;
        const clamped = Math.max(0, Math.min(n, total - 1));
        onIndexChange?.(clamped);
        return clamped;
      });
    },
    [total, onIndexChange],
  );

  const next = useCallback(() => updateIndex((i) => i + 1), [updateIndex]);
  const prev = useCallback(() => updateIndex((i) => i - 1), [updateIndex]);

  const exit = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    onExit();
  }, [onExit]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prev();
      } else if (e.key === 'Home') {
        updateIndex(0);
      } else if (e.key === 'End') {
        updateIndex(total - 1);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        exit();
      } else if (e.key >= '1' && e.key <= '9') {
        const n = Number(e.key) - 1;
        if (n < total) updateIndex(n);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, total, exit, updateIndex]);

  // Auto-hide chrome after idle
  useEffect(() => {
    function bump() {
      setChromeVisible(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setChromeVisible(false), 2500);
    }
    bump();
    window.addEventListener('mousemove', bump);
    window.addEventListener('keydown', bump);
    return () => {
      window.removeEventListener('mousemove', bump);
      window.removeEventListener('keydown', bump);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  // Try to enter fullscreen on mount.
  useEffect(() => {
    const el = document.documentElement;
    if (!document.fullscreenElement && el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }
    // Lock body scroll while presenting
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const current = slides[index];
  const progress = ((index + 1) / total) * 100;
  const slug_ = slug;

  return (
    <div className="present" role="dialog" aria-modal="true" aria-label={`Presenting ${title}`}>
      <div className="present-stage">
        <SlideFrame
          src={`/c/${slug_}/slides/${current.file}`}
          title={current.title ?? `Slide ${index + 1}`}
          showLoader
        />
      </div>

      <div className={`present-chrome ${chromeVisible ? '' : 'present-chrome-hidden'}`}>
        <div className="present-chrome-bar">
          <div className="present-brand">
            <StackdeckMark size={18} />
            <span className="present-brand-name">stackdeck</span>
            <span className="present-sep">/</span>
            <span className="present-title">{title}</span>
            {current.title ? (
              <>
                <span className="present-sep">·</span>
                <span className="present-slide-title">{current.title}</span>
              </>
            ) : null}
          </div>
          <div className="present-counter">
            <span className="present-counter-current">{String(index + 1).padStart(2, '0')}</span>
            <span className="present-counter-divider">/</span>
            <span className="present-counter-total">{String(total).padStart(2, '0')}</span>
          </div>
          <div className="present-actions">
            <button
              type="button"
              className="present-btn"
              onClick={prev}
              disabled={index === 0}
              aria-label="Previous slide"
              title="Previous (←)"
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path
                  d="M8 2L4 6l4 4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              className="present-btn"
              onClick={next}
              disabled={index === total - 1}
              aria-label="Next slide"
              title="Next (→)"
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path
                  d="M4 2l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              className="present-btn present-btn-text"
              onClick={exit}
              aria-label="Exit present mode"
              title="Exit (Esc)"
            >
              <span>Exit</span>
              <kbd>Esc</kbd>
            </button>
          </div>
        </div>
        <div className="present-progress">
          <div
            className="present-progress-fill"
            style={{ transform: `scaleX(${progress / 100})` }}
          />
        </div>
      </div>
    </div>
  );
}
