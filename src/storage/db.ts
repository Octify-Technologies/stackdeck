'use client';

const DB_NAME = 'stackdeck';
const DB_VERSION = 2;

export const STORE_DECKS = 'decks';
export const STORE_ASSETS = 'assets';
const STORE_BRANDS = 'brands';
const STORE_PREFS = 'prefs';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_DECKS)) {
        const store = db.createObjectStore(STORE_DECKS, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt');
      }
      if (!db.objectStoreNames.contains(STORE_BRANDS)) {
        db.createObjectStore(STORE_BRANDS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_PREFS)) {
        db.createObjectStore(STORE_PREFS);
      }
      if (!db.objectStoreNames.contains(STORE_ASSETS)) {
        const store = db.createObjectStore(STORE_ASSETS, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

async function runRequest<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const req = fn(store);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

export function dbGet<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
  return runRequest<T | undefined>(
    storeName,
    'readonly',
    (store) => store.get(key) as IDBRequest<T | undefined>,
  );
}

export function dbGetAll<T>(storeName: string): Promise<T[]> {
  return runRequest<T[]>(storeName, 'readonly', (store) => store.getAll() as IDBRequest<T[]>);
}

export async function dbPut<T extends { id: string }>(storeName: string, value: T): Promise<T> {
  await runRequest(storeName, 'readwrite', (store) => store.put(value));
  return value;
}

export async function dbDelete(storeName: string, key: IDBValidKey): Promise<void> {
  await runRequest(storeName, 'readwrite', (store) => store.delete(key));
}
