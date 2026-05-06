'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import { ParseError, parseDeck } from '@/ir/parse';
import { planDeck } from '@/ir/plan';
import type { Deck } from '@/ir/schema';
import { DeckRenderer } from '@/render/DeckRenderer';
import { getDeck } from '@/storage/deck-store';

type Props = { deckId: string };

export function PresentMode({ deckId }: Props) {
  const router = useRouter();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    getDeck(deckId).then((stored) => {
      if (cancelled) return;
      if (!stored) {
        router.replace('/');
        return;
      }
      try {
        const parsed = parseDeck(stored.source, { theme: stored.theme, brand: stored.brand });
        const planned = planDeck(parsed);
        setDeck(planned);
      } catch (e) {
        const message = e instanceof ParseError ? e.message : (e as Error).message;
        setError(message);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [deckId, router]);

  const total = deck?.slides.length ?? 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        setIndex((i) => Math.min(total - 1, i + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setIndex((i) => Math.max(0, i - 1));
      } else if (e.key === 'Home') {
        setIndex(0);
      } else if (e.key === 'End') {
        setIndex(total - 1);
      } else if (e.key === 'Escape') {
        router.push(`/d/${deckId}/edit`);
      } else if (/^[0-9]$/.test(e.key)) {
        const n = Number(e.key);
        if (n >= 1 && n <= total) setIndex(n - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [total, router, deckId]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      void el.requestFullscreen?.().catch(() => {});
    }
    return () => {
      if (document.fullscreenElement) {
        void document.exitFullscreen?.().catch(() => {});
      }
    };
  }, []);

  const visibleDeck = useMemo<Deck | null>(() => {
    if (!deck) return null;
    const slide = deck.slides[index];
    if (!slide) return deck;
    return { ...deck, slides: [slide] };
  }, [deck, index]);

  if (error) {
    return (
      <div className="present-error">
        <strong>Could not present this deck</strong>
        <pre>{error}</pre>
        <button type="button" onClick={() => router.push(`/d/${deckId}/edit`)}>
          Back to editor
        </button>
      </div>
    );
  }

  if (!deck || !visibleDeck) {
    return (
      <div className="present-loading">
        <span>Loading…</span>
      </div>
    );
  }

  return (
    <div className="present-stage" ref={stageRef}>
      <div className="present-frame">
        <DeckRenderer deck={visibleDeck} />
      </div>
      <div className="present-hud" aria-hidden="true">
        <span className="present-hud__page">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>
      <button
        type="button"
        className="present-nav present-nav--prev"
        aria-label="Previous slide"
        onClick={() => setIndex((i) => Math.max(0, i - 1))}
        disabled={index === 0}
      >
        ‹
      </button>
      <button
        type="button"
        className="present-nav present-nav--next"
        aria-label="Next slide"
        onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
        disabled={index === total - 1}
      >
        ›
      </button>
    </div>
  );
}
