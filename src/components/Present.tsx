'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SlideFrame } from './SlideFrame';
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

export function Present({ slug, slides, initialIndex, onIndexChange, onExit }: Props) {
  const [index, setIndex] = useState(() => Math.max(0, Math.min(initialIndex, slides.length - 1)));
  const [chromeVisible, setChromeVisible] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const total = slides.length;

  const updateIndex = useCallback(
    (next: number | ((i: number) => number)) => {
      // Keep this reducer pure. Parent sync happens in the effect below so
      // we never trigger a parent setState while React is mid-render.
      setIndex((prev) => {
        const n = typeof next === 'function' ? next(prev) : next;
        return Math.max(0, Math.min(n, total - 1));
      });
    },
    [total],
  );

  // Sync back to the parent after every committed index change.
  useEffect(() => {
    onIndexChange?.(index);
  }, [index, onIndexChange]);

  const next = useCallback(() => updateIndex((i) => i + 1), [updateIndex]);
  const prev = useCallback(() => updateIndex((i) => i - 1), [updateIndex]);

  const exitedRef = useRef(false);
  const exit = useCallback(() => {
    if (exitedRef.current) return;
    exitedRef.current = true;
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
        // Fallback path: browsers swallow Escape inside fullscreen and never
        // deliver it to the page, so this handler primarily covers the case
        // where the fullscreen request was denied/blocked.
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

  // Auto-hide the bottom pager after idle.
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

  // Enter fullscreen on mount, lock body scroll, and bridge the
  // browser-native Escape (which never reaches keydown) back to onExit by
  // listening for fullscreenchange.
  useEffect(() => {
    const el = document.documentElement;
    let enteredFullscreen = false;

    if (!document.fullscreenElement && el.requestFullscreen) {
      el.requestFullscreen()
        .then(() => {
          enteredFullscreen = true;
        })
        .catch(() => {
          // Denied or blocked: keydown handler still covers Escape.
        });
    } else if (document.fullscreenElement) {
      enteredFullscreen = true;
    }

    function onFullscreenChange() {
      if (document.fullscreenElement) {
        enteredFullscreen = true;
        return;
      }
      // Fullscreen just left. If we ever entered it, the user pressed
      // Escape (or otherwise exited) and expects to leave present mode.
      if (enteredFullscreen) exit();
    }
    document.addEventListener('fullscreenchange', onFullscreenChange);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.body.style.overflow = prevOverflow;
    };
  }, [exit]);

  const current = slides[index];

  return (
    <div className="present" role="dialog" aria-modal="true">
      <div className="present-stage">
        <SlideFrame
          src={`/c/${slug}/slides/${current.file}`}
          title={current.title ?? `Slide ${index + 1}`}
          showLoader
        />
      </div>

      <div
        className={`present-pager-wrap ${chromeVisible ? '' : 'present-pager-wrap-hidden'}`}
        aria-hidden={!chromeVisible}
      >
        <div className="present-pager" role="group" aria-label="Slide navigation">
          <button
            type="button"
            className="present-pager-btn"
            onClick={prev}
            disabled={index === 0}
            aria-label="Previous slide"
            title="Previous (←)"
          >
            <svg width="16" height="16" viewBox="0 0 12 12" fill="none">
              <path
                d="M8 2L4 6l4 4"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <span className="present-pager-counter">
            <span className="present-pager-counter-current">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="present-pager-counter-sep">/</span>
            <span className="present-pager-counter-total">{String(total).padStart(2, '0')}</span>
          </span>
          <button
            type="button"
            className="present-pager-btn"
            onClick={next}
            disabled={index === total - 1}
            aria-label="Next slide"
            title="Next (→)"
          >
            <svg width="16" height="16" viewBox="0 0 12 12" fill="none">
              <path
                d="M4 2l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
