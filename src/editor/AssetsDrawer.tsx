'use client';

import { useEffect, useRef, useState } from 'react';

import {
  type AssetSummary,
  assetSrc,
  deleteAsset,
  getAssetUrl,
  listAssets,
} from '@/storage/asset-store';

type Props = {
  onInsert: (snippet: string) => void;
  onClose: () => void;
  onUpload: (files: FileList | File[]) => Promise<void> | void;
};

export function AssetsDrawer({ onInsert, onClose, onUpload }: Props) {
  const [assets, setAssets] = useState<AssetSummary[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refresh = async () => {
    const list = await listAssets();
    setAssets(list);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      await onUpload(e.target.files);
      e.target.value = '';
      await refresh();
    }
  };

  const onRemove = async (id: string) => {
    await deleteAsset(id);
    await refresh();
  };

  const insertImage = (id: string, name: string) => {
    const safeAlt = name.replace(/"/g, "'");
    onInsert(`\n::image{src="${assetSrc(id)}" alt="${safeAlt}"}\n`);
  };

  return (
    <aside className="drawer assets-drawer" role="dialog" aria-label="Asset library">
      <header className="drawer__header">
        <h2 className="drawer__title">Assets</h2>
        <button type="button" className="drawer__close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </header>

      <div className="assets-drawer__upload">
        <button
          type="button"
          className="assets-drawer__upload-btn"
          onClick={() => fileInputRef.current?.click()}
        >
          Upload images
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={onFileChange}
        />
        <p className="assets-drawer__hint">
          Or drop images onto the preview, or paste from your clipboard.
        </p>
      </div>

      {assets.length === 0 ? (
        <div className="assets-drawer__empty">No assets yet.</div>
      ) : (
        <ul className="assets-drawer__grid">
          {assets.map((a) => (
            <AssetTile
              key={a.id}
              asset={a}
              onInsert={() => insertImage(a.id, a.name)}
              onRemove={() => onRemove(a.id)}
            />
          ))}
        </ul>
      )}
    </aside>
  );
}

function AssetTile({
  asset,
  onInsert,
  onRemove,
}: {
  asset: AssetSummary;
  onInsert: () => void;
  onRemove: () => void;
}) {
  const [url, setUrl] = useState<string | undefined>();

  useEffect(() => {
    let alive = true;
    void getAssetUrl(asset.id).then((u) => {
      if (alive) setUrl(u);
    });
    return () => {
      alive = false;
    };
  }, [asset.id]);

  return (
    <li className="assets-drawer__tile">
      <button
        type="button"
        className="assets-drawer__tile-btn"
        onClick={onInsert}
        title="Insert as ::image"
      >
        {url ? <img src={url} alt={asset.name} /> : <span className="assets-drawer__tile-ph" />}
      </button>
      <div className="assets-drawer__tile-meta">
        <span className="assets-drawer__tile-name" title={asset.name}>
          {asset.name}
        </span>
        <button
          type="button"
          className="assets-drawer__remove"
          onClick={onRemove}
          aria-label={`Delete ${asset.name}`}
        >
          Remove
        </button>
      </div>
    </li>
  );
}
