'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SlideFrame } from './SlideFrame';
import { StackdeckMark } from './StackdeckMark';
import { Present } from './Present';
import { generateDeckPdf, type ProgressEvent } from '@/lib/generate-pdf';
import './SlideFrame.css';
import './Viewer.css';

const CONTACT_EMAIL = 'ankur@octifytechnologies.com';
const SENDER_NAME = 'Ankur';

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
  const [pdfStatus, setPdfStatus] = useState<ProgressEvent | null>(null);
  // Personalization, read from `?to=<company>` so links sent out can be
  // tailored without changing app code or storing per-recipient state.
  const [recipient, setRecipient] = useState<string | null>(null);
  const total = slides.length;
  const current = slides[index];

  // Read `?to=` once on mount.
  useEffect(() => {
    const to = new URLSearchParams(window.location.search).get('to');
    if (to && to.length <= 80) setRecipient(to);
  }, []);

  // URL hash <-> slide index. On mount we honor an incoming `#3`; on every
  // subsequent navigation we write back via replaceState. The prevIndexRef
  // skips the first commit so we never clobber the incoming hash.
  const hashPrevIndex = useRef<number | null>(null);
  useEffect(() => {
    const m = window.location.hash.match(/^#(\d{1,3})$/);
    if (m) {
      const n = Math.max(1, Math.min(parseInt(m[1], 10), total)) - 1;
      setIndex(n);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (hashPrevIndex.current === null) {
      hashPrevIndex.current = index;
      return;
    }
    if (hashPrevIndex.current === index) return;
    hashPrevIndex.current = index;
    const target = `#${index + 1}`;
    if (window.location.hash !== target) {
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.search}${target}`,
      );
    }
  }, [index]);

  const mailtoHref = useMemo(() => {
    const subjectBits = ['Re:', title];
    if (client) subjectBits.push(`(${client})`);
    const subject = subjectBits.join(' ');
    const greeting = `Hi ${SENDER_NAME},`;
    const body = recipient
      ? `${greeting}\n\nThanks for sending the ${title} deck. A few thoughts from ${recipient}:\n\n`
      : `${greeting}\n\nThanks for sending the ${title} deck. A few thoughts:\n\n`;
    return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [title, client, recipient]);

  const pdfFilename = useMemo(() => {
    const safe = title.replace(/[\\/:*?"<>|]+/g, '').trim();
    return `Octify – ${safe}.pdf`;
  }, [title]);

  const downloadPdf = useCallback(async () => {
    if (pdfStatus && pdfStatus.phase !== 'done') return;
    try {
      await generateDeckPdf({
        slug,
        filename: pdfFilename,
        slides,
        contactCard: {
          deckTitle: title,
          client,
          recipient,
          senderName: SENDER_NAME,
          contactEmail: CONTACT_EMAIL,
        },
        onProgress: setPdfStatus,
      });
    } catch (err) {
      console.error('PDF generation failed', err);
      setPdfStatus(null);
      alert('Could not generate the PDF. Please try again.');
      return;
    }
    setTimeout(() => setPdfStatus(null), 1200);
  }, [slug, slides, pdfStatus, pdfFilename, title, client, recipient]);

  const pdfBusy = pdfStatus !== null && pdfStatus.phase !== 'done';
  const pdfLabel = (() => {
    if (!pdfStatus) return 'Download PDF';
    switch (pdfStatus.phase) {
      case 'preparing':
        return 'Preparing…';
      case 'rendering':
        return `Rendering ${pdfStatus.current} / ${pdfStatus.total}`;
      case 'composing':
        return 'Composing PDF…';
      case 'done':
        return 'Saved';
    }
  })();

  const slideUrl = useCallback((file: string) => `/c/${slug}/slides/${file}`, [slug]);

  const next = useCallback(() => setIndex((i) => Math.min(i + 1, total - 1)), [total]);
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);

  const enterPresent = useCallback(() => setPresenting(true), []);
  const exitPresent = useCallback(() => setPresenting(false), []);

  // Keep the active sidebar thumb in view as the user navigates. block:
  // 'nearest' = no-op when already visible, minimal scroll otherwise. The
  // scroll-margin set in CSS leaves room for the sticky CONTENTS header.
  useEffect(() => {
    const active = document.querySelector('.vstrip [aria-current="true"]') as HTMLElement | null;
    active?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [index]);

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
      } else if (e.key >= '1' && e.key <= '9') {
        const n = Number(e.key) - 1;
        if (n < total) setIndex(n);
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
            {recipient ? (
              <span className="vbar-recipient" title={`Personalized for ${recipient}`}>
                <span className="vbar-recipient-dot" aria-hidden />
                <span className="vbar-recipient-text">for {recipient}</span>
              </span>
            ) : null}
          </div>
        </div>

        <div className="vbar-right">
          <button
            type="button"
            onClick={downloadPdf}
            disabled={pdfBusy}
            className={`vbar-download ${pdfStatus ? 'vbar-download-active' : ''}`}
            title={pdfLabel}
            aria-label={pdfLabel}
            aria-busy={pdfBusy}
          >
            {pdfBusy ? <Spinner /> : <DownloadIcon />}
            <span className="vbar-download-text">{pdfLabel}</span>
          </button>

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
        <button
          type="button"
          className="vstage-frame"
          onClick={() => {
            if (window.matchMedia('(max-width: 900px)').matches) enterPresent();
          }}
          aria-label="Open slide fullscreen"
        >
          <SlideFrame
            src={slideUrl(current.file)}
            title={current.title ?? `Slide ${index + 1}`}
            showLoader
          />
          <span className="vstage-tap-hint">
            <ExpandIcon />
            <span>Tap to enlarge</span>
          </span>
        </button>
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
            <a href={mailtoHref} className="vstage-cta">
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
          ) : null}
        </div>

        {/* Persistent corner CTA, visible on every slide so a prospect who
            bails partway through always has a path back. Hidden on the last
            slide where the inline caption CTA already covers it. */}
        {index !== total - 1 ? (
          <a
            href={mailtoHref}
            className="vstage-corner-cta"
            title={`Email ${SENDER_NAME} at ${CONTACT_EMAIL}`}
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M2 4l5 4 5-4M2 4v6h10V4M2 4h10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Talk to {SENDER_NAME}</span>
          </a>
        ) : null}
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

function ExpandIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M2 5.5V2h3.5M12 8.5V12H8.5M2 8.5V12h3.5M12 5.5V2H8.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
      className="vbar-spinner"
    >
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" opacity="0.22" />
      <path
        d="M12.5 7a5.5 5.5 0 0 0-5.5-5.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
