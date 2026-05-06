'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

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
import {
  AppTopbar,
  Body,
  Button,
  Caption,
  GalleryGrid,
  Heading,
  Mono,
  PageMain,
  PageShell,
  PageWorkbar,
  Subheading,
} from '@/components';

type SortKey = 'recent' | 'oldest' | 'title';

export function DeckLibrary() {
  const [decks, setDecks] = useState<DeckSummary[] | null>(null);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('recent');

  useEffect(() => {
    listDecks().then(setDecks);
  }, []);

  const refresh = async () => setDecks(await listDecks());

  const visibleDecks = useMemo(() => {
    if (!decks) return null;
    const q = query.trim().toLowerCase();
    const filtered = q
      ? decks.filter(
          (d) =>
            d.title.toLowerCase().includes(q) || (d.templateName ?? '').toLowerCase().includes(q),
        )
      : decks.slice();
    switch (sort) {
      case 'oldest':
        return filtered.sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
      case 'title':
        return filtered.sort((a, b) => a.title.localeCompare(b.title));
      case 'recent':
      default:
        return filtered.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }
  }, [decks, query, sort]);

  const totalCount = decks?.length ?? 0;
  const visibleCount = visibleDecks?.length ?? 0;

  const countLabel = query
    ? `${visibleCount} of ${totalCount}`
    : `${totalCount} ${totalCount === 1 ? 'deck' : 'decks'}`;

  return (
    <PageShell className="library">
      <AppTopbar />

      <PageWorkbar
        title="Decks"
        count={countLabel}
        actions={
          <>
            <SearchField value={query} onChange={setQuery} />
            <SortControl value={sort} onChange={setSort} />
          </>
        }
      />

      <PageMain className="library__main">
        {decks === null ? (
          <Mono as="div" className="library__loading">
            Loading decks
          </Mono>
        ) : decks.length === 0 ? (
          <EmptyState />
        ) : visibleCount === 0 ? (
          <NoMatches query={query} onClear={() => setQuery('')} />
        ) : (
          <GalleryGrid>
            {query ? null : (
              <Link href="/new" className="surface-card surface-card--dashed library__new-card">
                <div className="library__new-card-icon" aria-hidden>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M7 2.5V11.5M2.5 7H11.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="library__new-card-text">
                  <Body strong>Start a new deck</Body>
                  <Caption muted>Pick a template or write from scratch</Caption>
                </div>
              </Link>
            )}
            {visibleDecks!.map((deck) => (
              <DeckCard key={deck.id} deck={deck} onChange={refresh} />
            ))}
          </GalleryGrid>
        )}
      </PageMain>
    </PageShell>
  );
}

function SearchField({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  return (
    <label className="library__search">
      <svg
        className="library__search-icon"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden
      >
        <circle cx="6.25" cy="6.25" r="3.75" stroke="currentColor" strokeWidth="1.3" />
        <path d="M9 9L11.5 11.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search decks"
        className="library__search-input"
        aria-label="Search decks"
      />
      {value ? (
        <button
          type="button"
          className="library__search-clear"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M2 2L8 8M8 2L2 8"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </button>
      ) : null}
    </label>
  );
}

function SortControl({ value, onChange }: { value: SortKey; onChange: (next: SortKey) => void }) {
  const options: { id: SortKey; label: string }[] = [
    { id: 'recent', label: 'Recent' },
    { id: 'oldest', label: 'Oldest' },
    { id: 'title', label: 'A–Z' },
  ];
  return (
    <div className="library__sort" role="group" aria-label="Sort decks">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className={`library__sort-option${
            value === opt.id ? ' library__sort-option--active' : ''
          }`}
          onClick={() => onChange(opt.id)}
          aria-pressed={value === opt.id}
        >
          {opt.label}
        </button>
      ))}
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
      <Heading level={2} size="xl">
        No decks yet
      </Heading>
      <Subheading>
        Pick a template to get started, or write a deck from scratch in markdown.
      </Subheading>
      <div className="library__empty-actions">
        <Button as="link" href="/new" variant="primary">
          Start a deck
        </Button>
      </div>
    </div>
  );
}

function NoMatches({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="library__nomatch">
      <Heading level={2} size="xl">
        No decks match &ldquo;{query}&rdquo;
      </Heading>
      <Subheading>Try a different search, or clear the filter to see everything.</Subheading>
      <Button variant="primary" onClick={onClear}>
        Clear search
      </Button>
    </div>
  );
}

function DeckCard({ deck, onChange }: { deck: DeckSummary; onChange: () => Promise<void> }) {
  const [previewSource, setPreviewSource] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getDeck(deck.id).then((stored) => {
      if (!cancelled && stored) setPreviewSource(stored.source);
    });
    return () => {
      cancelled = true;
    };
  }, [deck.id]);

  const planned = useMemo(() => {
    if (!previewSource) return null;
    try {
      const parsed = parseDeck(previewSource, { theme: deck.theme, brand: deck.brand });
      return planDeck(parsed);
    } catch (e) {
      void e;
      return null;
    }
  }, [previewSource, deck.theme, deck.brand]);

  const previewDeck = planned ? { ...planned, slides: planned.slides.slice(0, 1) } : null;
  const slideCount = planned?.slides.length ?? 0;

  const updated = formatRelativeDate(deck.updatedAt);

  const templateAttr = deck.templateName ? templateSlug(deck.templateName) : undefined;

  return (
    <div
      className={`surface-card deck-card${confirming ? ' deck-card--confirming' : ''}`}
      data-template={templateAttr}
    >
      <Link href={`/d/${deck.id}/edit`} className="deck-card__link">
        <div className="deck-card__preview">
          {previewDeck ? (
            <div className="deck-card__scaler">
              <DeckRenderer deck={previewDeck} />
            </div>
          ) : (
            <div className="deck-card__preview-placeholder" />
          )}
          <div className="deck-card__preview-shade" aria-hidden />
        </div>
        <div className="deck-card__meta">
          <Heading level={3} size="md">
            {deck.title}
          </Heading>
          <div className="deck-card__sub">
            <Caption as="span" muted>
              {updated}
            </Caption>
            <span className="deck-card__sub-dot" aria-hidden>
              ·
            </span>
            <Mono>
              {slideCount > 0 ? `${slideCount} ${slideCount === 1 ? 'slide' : 'slides'}` : '—'}
            </Mono>
            {deck.templateName ? (
              <span className="deck-card__chip" data-template={templateSlug(deck.templateName)}>
                {deck.templateName}
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      {confirming ? (
        <div className="deck-card__confirm" role="alertdialog" aria-label={`Delete ${deck.title}`}>
          <Caption as="span" className="deck-card__confirm-text">
            Delete?
          </Caption>
          <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={async () => {
              await deleteDeck(deck.id);
              setConfirming(false);
              await onChange();
            }}
          >
            Delete
          </Button>
        </div>
      ) : (
        <div className="deck-card__actions">
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={async () => {
              await duplicateDeck(deck.id);
              await onChange();
            }}
            aria-label="Duplicate deck"
            title="Duplicate"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect
                x="3.5"
                y="3.5"
                width="7.5"
                height="7.5"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <path
                d="M3.5 9V3C3.5 2.44772 3.94772 2 4.5 2H9.5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </Button>
          <Button
            variant="danger"
            size="sm"
            iconOnly
            onClick={() => setConfirming(true)}
            aria-label="Delete deck"
            title="Delete"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M3 4.5H11M5.5 4.5V3.25C5.5 2.83579 5.83579 2.5 6.25 2.5H7.75C8.16421 2.5 8.5 2.83579 8.5 3.25V4.5M4.5 4.5L5 11C5 11.4142 5.33579 11.75 5.75 11.75H8.25C8.66421 11.75 9 11.4142 9 11L9.5 4.5"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
        </div>
      )}
    </div>
  );
}

function templateSlug(name: string): string {
  const key = name.toLowerCase();
  if (key.includes('pitch')) return 'pitch';
  if (key.includes('editorial')) return 'editorial';
  return 'other';
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
