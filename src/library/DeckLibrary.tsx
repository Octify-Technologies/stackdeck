'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { parseDeck } from '@/ir/parse';
import { planDeck } from '@/ir/plan';
import {
  type DeckSummary,
  deleteDeck,
  duplicateDeck,
  getDeck,
  listDecks,
} from '@/storage/deck-store';
import { DeckRenderer } from '@/render/DeckRenderer';

export function DeckLibrary() {
  const [decks, setDecks] = useState<DeckSummary[] | null>(null);

  useEffect(() => {
    listDecks().then(setDecks);
  }, []);

  const refresh = async () => setDecks(await listDecks());

  return (
    <div className="library">
      <header className="library__topbar">
        <Link href="/" className="library__brand">
          <span className="library__brand-mark">◐</span>
          <span className="library__brand-name">stackdeck</span>
        </Link>
        <div className="library__topbar-actions">
          <Link href="/templates" className="library__nav-link">
            Templates
          </Link>
          <a
            href="https://github.com/Octify-Technologies/stackdeck"
            target="_blank"
            rel="noopener noreferrer"
            className="library__nav-link"
          >
            GitHub ↗
          </a>
        </div>
      </header>

      <main className="library__main">
        <section className="library__hero">
          <div>
            <p className="library__eyebrow">Your workspace</p>
            <h1 className="library__title">Decks</h1>
            <p className="library__subtitle">
              Markdown becomes presentations. One source of truth, every theme.
            </p>
          </div>
          <Link href="/new" className="library__cta">
            <span aria-hidden>+</span> New deck
          </Link>
        </section>

        {decks === null ? (
          <div className="library__loading">Loading…</div>
        ) : decks.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="library__grid">
            <Link href="/new" className="library__new-card">
              <div className="library__new-card-icon" aria-hidden>
                +
              </div>
              <div className="library__new-card-text">
                <span className="library__new-card-title">Start a new deck</span>
                <span className="library__new-card-sub">Pick a template, write markdown</span>
              </div>
            </Link>
            {decks.map((deck) => (
              <DeckCard key={deck.id} deck={deck} onChange={refresh} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="library__empty">
      <div className="library__empty-art" aria-hidden>
        <span>::cover</span>
        <span>
          # Your first deck.
          <br />A blank page is a beautiful start.
        </span>
        <span>::</span>
      </div>
      <h2>No decks yet</h2>
      <p>Pick a template to get started, or write a deck from scratch in markdown.</p>
      <div className="library__empty-actions">
        <Link href="/new" className="library__cta">
          Browse templates
        </Link>
      </div>
    </div>
  );
}

function DeckCard({ deck, onChange }: { deck: DeckSummary; onChange: () => Promise<void> }) {
  const [previewSource, setPreviewSource] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getDeck(deck.id).then((stored) => {
      if (!cancelled && stored) setPreviewSource(stored.source);
    });
    return () => {
      cancelled = true;
    };
  }, [deck.id]);

  const previewDeck = (() => {
    if (!previewSource) return null;
    try {
      const parsed = parseDeck(previewSource, { theme: deck.theme, brand: deck.brand });
      const planned = planDeck(parsed);
      return { ...planned, slides: planned.slides.slice(0, 1) };
    } catch (e) {
      void e;
      return null;
    }
  })();

  const updated = formatRelativeDate(deck.updatedAt);

  return (
    <div className="deck-card">
      <Link href={`/d/${deck.id}/edit`} className="deck-card__link">
        <div className="deck-card__preview">
          {previewDeck ? (
            <div className="deck-card__scaler">
              <DeckRenderer deck={previewDeck} />
            </div>
          ) : (
            <div className="deck-card__preview-placeholder" />
          )}
        </div>
        <div className="deck-card__meta">
          <h3 className="deck-card__title">{deck.title}</h3>
          <div className="deck-card__row">
            <span className="deck-card__chip">{deck.theme.styleId}</span>
            {deck.templateName ? (
              <span className="deck-card__chip">{deck.templateName}</span>
            ) : null}
            <span className="deck-card__date">{updated}</span>
          </div>
        </div>
      </Link>
      <div className="deck-card__actions">
        <button
          type="button"
          className="deck-card__action"
          onClick={async () => {
            await duplicateDeck(deck.id);
            await onChange();
          }}
          aria-label="Duplicate deck"
          title="Duplicate"
        >
          ⧉
        </button>
        <button
          type="button"
          className="deck-card__action deck-card__action--danger"
          onClick={async () => {
            if (!confirm(`Delete "${deck.title}"? This cannot be undone.`)) return;
            await deleteDeck(deck.id);
            await onChange();
          }}
          aria-label="Delete deck"
          title="Delete"
        >
          ×
        </button>
      </div>
    </div>
  );
}

function formatRelativeDate(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
