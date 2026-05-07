'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { SlideFrame } from './SlideFrame';
import { StackdeckMark } from './StackdeckMark';
import { Present } from './Present';
import './SlideFrame.css';
import './Viewer.css';

const CONTACT_EMAIL = 'hello@octifytechnologies.com';

type SlideRef = { file: string; title?: string };

type Props = {
  slug: string;
  title: string;
  client?: string;
  slides: SlideRef[];
};

export function Viewer({ slug, title, client, slides }: Props) {
  const [index, setIndex] = useState(0);
  const [presenting, setPresenting] = useState(false);
  const total = slides.length;
  const current = slides[index];

  const slideUrl = useCallback((file: string) => `/c/${slug}/slides/${file}`, [slug]);

  const next = useCallback(() => setIndex((i) => Math.min(i + 1, total - 1)), [total]);
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);

  const enterPresent = useCallback(() => setPresenting(true), []);
  const exitPresent = useCallback(() => setPresenting(false), []);

  useEffect(() => {
    if (presenting) return; // Present component owns its own keys
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prev();
      } else if (e.key === 'Home') {
        setIndex(0);
      } else if (e.key === 'End') {
        setIndex(total - 1);
      } else if (e.key === 'f' || e.key === 'F') {
        enterPresent();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, total, enterPresent, presenting]);

  const progress = (index + 1) / total;

  return (
    <div className="viewer">
      <header className="vbar">
        <div className="vbar-left">
          <Link href="/" className="vbar-brand" aria-label="stackdeck">
            <StackdeckMark size={20} />
          </Link>

          <span className="vbar-sep" aria-hidden />

          <Link href="/" className="vbar-crumb vbar-crumb-link">
            <ChevronLeft />
            <span>All decks</span>
          </Link>

          <span className="vbar-sep" aria-hidden />

          <div className="vbar-crumb-trail" title={title}>
            {client ? <span className="vbar-crumb-client">{client}</span> : null}
            {client ? <ChevronRight muted /> : null}
            <span className="vbar-crumb-current">{title}</span>
          </div>
        </div>

        <div className="vbar-right">
          <a
            href={`/c/${slug}/print`}
            target="_blank"
            rel="noreferrer"
            className="vbar-icon-btn"
            title="Download PDF"
            aria-label="Download as PDF"
          >
            <DownloadIcon />
          </a>

          <button type="button" onClick={enterPresent} className="vbar-cta" title="Present (F)">
            <PlayIcon />
            <span>Present</span>
            <kbd className="vbar-cta-key">F</kbd>
          </button>
        </div>
      </header>

      <div className="vprogress" aria-hidden>
        <div className="vprogress-fill" style={{ transform: `scaleX(${progress})` }} />
      </div>

      <main className="vstage">
        <div className="vstage-frame">
          <SlideFrame
            src={slideUrl(current.file)}
            title={current.title ?? `Slide ${index + 1}`}
            showLoader
          />
        </div>
        <div className="vstage-caption">
          <div className="vstage-pager" role="group" aria-label="Slide navigation">
            <button
              type="button"
              className="vstage-pager-btn"
              onClick={prev}
              disabled={index === 0}
              aria-label="Previous slide"
              title="Previous (←)"
            >
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                <path
                  d="M8 2L4 6l4 4"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <span className="vstage-pager-counter">
              <span className="vstage-pager-counter-current">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="vstage-pager-counter-sep">/</span>
              <span className="vstage-pager-counter-total">{String(total).padStart(2, '0')}</span>
            </span>
            <button
              type="button"
              className="vstage-pager-btn"
              onClick={next}
              disabled={index === total - 1}
              aria-label="Next slide"
              title="Next (→)"
            >
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
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

          {current.title ? <span className="vstage-caption-title">{current.title}</span> : null}

          {index === total - 1 ? (
            <a href={`mailto:${CONTACT_EMAIL}`} className="vstage-cta">
              <span>Like what you see?</span>
              <span className="vstage-cta-action">Get in touch</span>
              <svg width="12" height="10" viewBox="0 0 14 10" fill="none">
                <path
                  d="M1 5h12m0 0L9 1m4 4L9 9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          ) : (
            <span className="vstage-caption-hint">
              <kbd>←</kbd>
              <kbd>→</kbd>
              <span>navigate</span>
              <span className="vstage-caption-sep" aria-hidden>
                ·
              </span>
              <kbd>F</kbd>
              <span>present</span>
            </span>
          )}
        </div>
      </main>

      <aside className="vstrip" aria-label="Slides">
        <div className="vstrip-head">
          <span className="vstrip-head-label">Contents</span>
          <span className="vstrip-head-count">
            {String(index + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}
          </span>
        </div>
        <div className="vstrip-list">
          {slides.map((s, i) => (
            <button
              key={s.file}
              type="button"
              className={`thumb ${i === index ? 'thumb-active' : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}${s.title ? `: ${s.title}` : ''}`}
              aria-current={i === index}
            >
              <div className="thumb-frame">
                <SlideFrame src={slideUrl(s.file)} title={s.title} lazy interactive={false} />
                <span className="thumb-num" aria-hidden>
                  {String(i + 1).padStart(2, '0')}
                </span>
                {i === index ? (
                  <span className="thumb-badge" aria-hidden>
                    <PlayingDot />
                  </span>
                ) : null}
              </div>
              <span className="thumb-title">{s.title || `Slide ${i + 1}`}</span>
            </button>
          ))}
        </div>
      </aside>

      {presenting ? (
        <Present
          slug={slug}
          title={title}
          slides={slides}
          initialIndex={index}
          onIndexChange={setIndex}
          onExit={exitPresent}
        />
      ) : null}
    </div>
  );
}

function ChevronLeft() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M8 2L4 6l4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight({ muted }: { muted?: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
      style={{ opacity: muted ? 0.45 : 1 }}
    >
      <path
        d="M4 2l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M3 2v8l7-4-7-4z" fill="currentColor" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M7 1.5v7M4 6l3 3 3-3M2 11.5h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlayingDot() {
  return (
    <span className="playing-dot">
      <span />
      <span />
      <span />
    </span>
  );
}
