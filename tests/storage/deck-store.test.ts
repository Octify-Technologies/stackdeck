import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  type StoredDeck,
  createDeck,
  deleteDeck,
  duplicateDeck,
  getDeck,
  listDecks,
  updateDeck,
} from '@/storage/deck-store';

// In-memory fake IndexedDB. Simple enough to test our store logic without
// pulling in fake-indexeddb. We replace global.indexedDB with this.

class FakeRequest<T> {
  result: T | undefined;
  onsuccess: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(result: T) {
    this.result = result;
    queueMicrotask(() => this.onsuccess?.());
  }
}

class FakeStore {
  data = new Map<string, unknown>();
  put(value: { id: string }) {
    this.data.set(value.id, value);
    return new FakeRequest(undefined);
  }
  get(key: string) {
    return new FakeRequest(this.data.get(key));
  }
  getAll() {
    return new FakeRequest(Array.from(this.data.values()));
  }
  delete(key: string) {
    this.data.delete(key);
    return new FakeRequest(undefined);
  }
  count() {
    return new FakeRequest(this.data.size);
  }
  createIndex() {}
}

class FakeTransaction {
  oncomplete: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onabort: (() => void) | null = null;
  constructor(private store: FakeStore) {
    queueMicrotask(() => this.oncomplete?.());
  }
  objectStore() {
    return this.store;
  }
}

class FakeDb {
  store = new FakeStore();
  brands = new FakeStore();
  prefs = new FakeStore();
  objectStoreNames = {
    contains: () => true,
  };
  transaction(name: string) {
    if (name === 'brands') return new FakeTransaction(this.brands);
    if (name === 'prefs') return new FakeTransaction(this.prefs);
    return new FakeTransaction(this.store);
  }
  createObjectStore() {
    return new FakeStore();
  }
}

const installFakeIdb = () => {
  const db = new FakeDb();
  const open = () => {
    const req: {
      result: FakeDb;
      onupgradeneeded: (() => void) | null;
      onsuccess: (() => void) | null;
      onerror: (() => void) | null;
    } = {
      result: db,
      onupgradeneeded: null,
      onsuccess: null,
      onerror: null,
    };
    queueMicrotask(() => req.onsuccess?.());
    return req;
  };
  (globalThis as unknown as { indexedDB: { open: typeof open } }).indexedDB = { open };
  return db;
};

describe('deck-store', () => {
  beforeEach(() => {
    installFakeIdb();
  });

  afterEach(() => {
    // Keep the fake IDB present across tests; the db.ts module caches the
    // first opened db handle. All assertions below are order-independent
    // (they reference IDs of decks created in the same test).
  });

  it('creates a deck with auto-generated id, title, and timestamps', async () => {
    const created = await createDeck({
      source: '# Hello\n\nbody',
      theme: { styleId: 'modern', paletteId: 'electric', density: 'comfortable', mode: 'light' },
    });
    expect(created.id).toBeTruthy();
    expect(created.title).toBe('Hello');
    expect(created.createdAt).toBeTruthy();
    expect(created.updatedAt).toBe(created.createdAt);
  });

  it('extracts title from frontmatter when present', async () => {
    const created = await createDeck({
      source: '---\ntitle: My Deck\n---\n\n# Heading',
      theme: { styleId: 'modern', paletteId: 'electric', density: 'comfortable', mode: 'light' },
    });
    expect(created.title).toBe('My Deck');
  });

  it('falls back to "Untitled Deck" when no title is detectable', async () => {
    const created = await createDeck({
      source: 'just text, no headings',
      theme: { styleId: 'modern', paletteId: 'electric', density: 'comfortable', mode: 'light' },
    });
    expect(created.title).toBe('Untitled Deck');
  });

  it('round-trips a deck through getDeck', async () => {
    const created = await createDeck({
      source: '# A',
      theme: { styleId: 'modern', paletteId: 'electric', density: 'comfortable', mode: 'light' },
    });
    const fetched = await getDeck(created.id);
    expect(fetched).toMatchObject({ id: created.id, title: 'A' });
  });

  it('listDecks returns summaries with newer decks before older', async () => {
    const a = await createDeck({
      source: '# Sort A',
      theme: { styleId: 'modern', paletteId: 'electric', density: 'comfortable', mode: 'light' },
    });
    await new Promise((r) => setTimeout(r, 5));
    const b = await createDeck({
      source: '# Sort B',
      theme: { styleId: 'modern', paletteId: 'electric', density: 'comfortable', mode: 'light' },
    });
    const decks = await listDecks();
    const indexA = decks.findIndex((d) => d.id === a.id);
    const indexB = decks.findIndex((d) => d.id === b.id);
    expect(indexB).toBeLessThan(indexA);
    expect((decks[0] as Partial<StoredDeck>).source).toBeUndefined();
  });

  it('updateDeck updates source and bumps updatedAt', async () => {
    const created = await createDeck({
      source: '# A',
      theme: { styleId: 'modern', paletteId: 'electric', density: 'comfortable', mode: 'light' },
    });
    await new Promise((r) => setTimeout(r, 5));
    const updated = await updateDeck(created.id, { source: '# B' });
    expect(updated?.title).toBe('B');
    expect(updated?.updatedAt).not.toBe(created.updatedAt);
  });

  it('updateDeck on missing id returns undefined', async () => {
    const result = await updateDeck('nope', { source: '# X' });
    expect(result).toBeUndefined();
  });

  it('deleteDeck removes the deck', async () => {
    const created = await createDeck({
      source: '# A',
      theme: { styleId: 'modern', paletteId: 'electric', density: 'comfortable', mode: 'light' },
    });
    await deleteDeck(created.id);
    expect(await getDeck(created.id)).toBeUndefined();
  });

  it('duplicateDeck creates a new deck with "(copy)" suffix', async () => {
    const created = await createDeck({
      source: '# Hello',
      theme: { styleId: 'modern', paletteId: 'electric', density: 'comfortable', mode: 'light' },
    });
    const dup = await duplicateDeck(created.id);
    expect(dup?.id).not.toBe(created.id);
    expect(dup?.title).toBe('Hello (copy)');
    expect(dup?.source).toBe(created.source);
  });
});
