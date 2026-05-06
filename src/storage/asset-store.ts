'use client';

import { ulid } from 'ulid';

import { dbDelete, dbGet, dbGetAll, dbPut, STORE_ASSETS } from './db';

export type StoredAsset = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  blob: Blob;
  createdAt: string;
};

export type AssetSummary = Omit<StoredAsset, 'blob'>;

const objectUrlCache = new Map<string, string>();

export async function createAsset(input: { blob: Blob; name?: string }): Promise<StoredAsset> {
  const id = ulid();
  const asset: StoredAsset = {
    id,
    name: input.name ?? `image-${id.slice(-6)}`,
    mimeType: input.blob.type || 'application/octet-stream',
    size: input.blob.size,
    blob: input.blob,
    createdAt: new Date().toISOString(),
  };
  await dbPut(STORE_ASSETS, asset);
  return asset;
}

export async function getAsset(id: string): Promise<StoredAsset | undefined> {
  return dbGet<StoredAsset>(STORE_ASSETS, id);
}

export async function listAssets(): Promise<AssetSummary[]> {
  const all = await dbGetAll<StoredAsset>(STORE_ASSETS);
  return all
    .map(({ blob: _blob, ...rest }) => rest)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function deleteAsset(id: string): Promise<void> {
  const cached = objectUrlCache.get(id);
  if (cached) {
    URL.revokeObjectURL(cached);
    objectUrlCache.delete(id);
  }
  await dbDelete(STORE_ASSETS, id);
}

export async function getAssetUrl(id: string): Promise<string | undefined> {
  const cached = objectUrlCache.get(id);
  if (cached) return cached;
  const asset = await getAsset(id);
  if (!asset) return undefined;
  const url = URL.createObjectURL(asset.blob);
  objectUrlCache.set(id, url);
  return url;
}

export function isAssetSrc(src: string): boolean {
  return src.startsWith('asset:');
}

export function assetIdFromSrc(src: string): string | undefined {
  if (!isAssetSrc(src)) return undefined;
  return src.slice('asset:'.length);
}

export function assetSrc(id: string): string {
  return `asset:${id}`;
}
