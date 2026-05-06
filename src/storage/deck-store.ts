'use client';

import { ulid } from 'ulid';

import type { Brand, ThemeRef } from '@/ir/schema';
import { DEFAULT_PRESET_ID } from '@/app/presets/presets';

import { dbDelete, dbGet, dbGetAll, dbPut, STORE_DECKS } from './db';

/**
 * Migrate legacy deck records onto the current ThemeRef shape. Older records
 * may carry `styleId`, `density`, or a `fonts.font` triple; today's ThemeRef
 * is just `{ presetId, paletteId?, fontId? }`. Unknown ids fall back at
 * render time via `getPreset` / `getPalette`.
 */
function migrateTheme(theme: unknown): ThemeRef {
  const t = (theme ?? {}) as Partial<ThemeRef> & {
    styleId?: string;
    density?: string;
    fonts?: { font?: string };
  };
  return {
    presetId: t.presetId ?? DEFAULT_PRESET_ID,
    paletteId: t.paletteId,
    fontId: t.fontId ?? t.fonts?.font,
  };
}

function migrateDeck<T extends { theme: ThemeRef }>(deck: T): T {
  return { ...deck, theme: migrateTheme(deck.theme) };
}

/**
 * A persisted deck record. We store the markdown source plus the theme + brand
 * choices and re-parse on load. This means schema changes never break decks.
 */
export type StoredDeck = {
  id: string;
  title: string;
  source: string;
  theme: ThemeRef;
  brand?: Brand;
  templateName?: string;
  createdAt: string;
  updatedAt: string;
};

export type DeckSummary = Pick<
  StoredDeck,
  'id' | 'title' | 'theme' | 'brand' | 'templateName' | 'updatedAt' | 'createdAt'
>;

export async function listDecks(): Promise<DeckSummary[]> {
  const all = await dbGetAll<StoredDeck>(STORE_DECKS);
  return all
    .map(migrateDeck)
    .map(({ source: _source, ...summary }) => {
      void _source;
      return summary;
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getDeck(id: string): Promise<StoredDeck | undefined> {
  const deck = await dbGet<StoredDeck>(STORE_DECKS, id);
  return deck ? migrateDeck(deck) : undefined;
}

type CreateInput = {
  title?: string;
  source: string;
  theme: ThemeRef;
  brand?: Brand;
  templateName?: string;
};

export async function createDeck(input: CreateInput): Promise<StoredDeck> {
  const now = new Date().toISOString();
  const deck: StoredDeck = {
    id: ulid(),
    title: input.title ?? extractTitle(input.source) ?? 'Untitled Deck',
    source: input.source,
    theme: input.theme,
    brand: input.brand,
    templateName: input.templateName,
    createdAt: now,
    updatedAt: now,
  };
  await dbPut(STORE_DECKS, deck);
  return deck;
}

type UpdateInput = Partial<
  Pick<StoredDeck, 'title' | 'source' | 'theme' | 'brand' | 'templateName'>
>;

export async function updateDeck(id: string, patch: UpdateInput): Promise<StoredDeck | undefined> {
  const existing = await getDeck(id);
  if (!existing) return undefined;
  const next: StoredDeck = {
    ...existing,
    ...patch,
    title: patch.title ?? existing.title,
    updatedAt: new Date().toISOString(),
  };
  await dbPut(STORE_DECKS, next);
  return next;
}

export async function deleteDeck(id: string): Promise<void> {
  await dbDelete(STORE_DECKS, id);
}

export async function duplicateDeck(id: string): Promise<StoredDeck | undefined> {
  const existing = await getDeck(id);
  if (!existing) return undefined;
  return createDeck({
    title: `${existing.title} (copy)`,
    source: existing.source,
    theme: existing.theme,
    brand: existing.brand,
    templateName: existing.templateName,
  });
}

function extractTitle(markdown: string): string | undefined {
  const matchFrontmatter = /^---\s*\n[\s\S]*?title:\s*(.+?)\s*\n[\s\S]*?---/m.exec(markdown);
  if (matchFrontmatter) return matchFrontmatter[1].trim().replace(/^['"]|['"]$/g, '');
  const matchHeading = /^#\s+(.+)$/m.exec(markdown);
  if (matchHeading) return matchHeading[1].trim().replace(/\.$/, '');
  return undefined;
}
