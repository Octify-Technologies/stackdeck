'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ParseError, parseDeck } from '@/ir/parse';
import { planDeck } from '@/ir/plan';
import { reorderSlide } from '@/ir/source-edit';
import { lintColors } from '@/render/lint';
import { resolveTheme } from '@/render/theme-resolver';
import type { Brand, Deck, ThemeRef } from '@/ir/schema';
import { createAsset, assetSrc } from '@/storage/asset-store';
import { getDeck, type StoredDeck, updateDeck } from '@/storage/deck-store';
import { DeckRenderer } from '@/render/DeckRenderer';
import { ExportPdf } from '@/render/ExportPdf';
import { getPalette } from '@/themes/registry';
import { DEFAULT_PRESET_ID, getPreset, PRESETS } from '@/app/presets/presets';

import { AssetsDrawer } from './AssetsDrawer';
import { InsertMenu } from './InsertMenu';
import { SAMPLE_MARKDOWN } from './sample-deck';
import { SourceEditor } from './SourceEditor';
import { ThemeDrawer } from './ThemeDrawer';

type EditorState = {
  presetId: string;
  paletteId: string;
  fontId?: string;
  brand: Brand;
};

const DEFAULT_STATE: EditorState = {
  presetId: DEFAULT_PRESET_ID,
  paletteId: PRESETS[0].paletteId,
  fontId: undefined,
  brand: {},
};

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

type Props = {
  deckId?: string;
};

const SOURCE_WIDTH_KEY = 'stackdeck:source-width';
const SOURCE_WIDTH_DEFAULT = 480;
const SOURCE_WIDTH_MIN = 320;
const SOURCE_WIDTH_MAX = 900;

export function Editor({ deckId }: Props) {
  const router = useRouter();
  const [source, setSource] = useState(SAMPLE_MARKDOWN);
  const [state, setState] = useState<EditorState>(DEFAULT_STATE);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [assetsOpen, setAssetsOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [loaded, setLoaded] = useState(!deckId);
  const [storedDeck, setStoredDeck] = useState<StoredDeck | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const insertRef = useRef<((s: string) => void) | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextSaveRef = useRef(false);

  const [sourceWidth, setSourceWidth] = useState<number>(SOURCE_WIDTH_DEFAULT);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(SOURCE_WIDTH_KEY);
    if (!raw) return;
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    setSourceWidth(Math.min(SOURCE_WIDTH_MAX, Math.max(SOURCE_WIDTH_MIN, n)));
  }, []);

  const commitSourceWidth = useCallback((next: number) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(SOURCE_WIDTH_KEY, String(next));
  }, []);

  useEffect(() => {
    if (!deckId) {
      setLoaded(true);
      return;
    }
    setLoaded(false);
    let cancelled = false;
    getDeck(deckId).then((deck) => {
      if (cancelled) return;
      if (!deck) {
        router.replace('/');
        return;
      }
      skipNextSaveRef.current = true;
      setStoredDeck(deck);
      setSource(deck.source);
      const presetForDeck = getPreset(deck.theme.presetId);
      setState({
        presetId: deck.theme.presetId,
        paletteId: deck.theme.paletteId ?? presetForDeck.paletteId,
        fontId: deck.theme.fontId,
        brand: deck.brand ?? {},
      });
      setSaveStatus('idle');
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [deckId, router]);

  useEffect(() => {
    if (!deckId || !loaded) return;
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    setSaveStatus('saving');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        const next = await updateDeck(deckId, {
          source,
          theme: {
            presetId: state.presetId,
            paletteId: state.paletteId,
            fontId: state.fontId,
          },
          brand: state.brand,
        });
        if (next) setStoredDeck(next);
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
      }
    }, 500);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [deckId, loaded, source, state]);

  const theme: ThemeRef = useMemo(
    () => ({
      presetId: state.presetId,
      paletteId: state.paletteId,
      fontId: state.fontId,
    }),
    [state.presetId, state.paletteId, state.fontId],
  );

  const lintWarnings = useMemo(() => {
    try {
      const preset = getPreset(state.presetId);
      const palette = getPalette(state.paletteId);
      const resolved = resolveTheme(theme, preset, palette, state.brand);
      return lintColors(resolved.colors);
    } catch {
      return [];
    }
  }, [theme, state.presetId, state.paletteId, state.brand]);

  const result = useMemo(() => {
    try {
      const parsed = parseDeck(source, { theme, brand: state.brand });
      const planned = planDeck(parsed);
      return { ok: true as const, deck: planned };
    } catch (e) {
      const message = e instanceof ParseError ? e.message : (e as Error).message;
      return { ok: false as const, error: message };
    }
  }, [source, theme, state.brand]);

  const handleSelectSlide = useCallback((index: number) => {
    setSelectedSlide(index);
  }, []);

  const handleReorderSlide = useCallback((from: number, to: number) => {
    setSource((s) => reorderSlide(s, from, to));
    setSelectedSlide(to);
  }, []);

  const handleInsert = useCallback((snippet: string) => {
    insertRef.current?.(snippet);
  }, []);

  const handleImageFiles = useCallback(async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
    for (const file of list) {
      const asset = await createAsset({ blob: file, name: file.name });
      const safeAlt = (file.name || 'image').replace(/"/g, "'");
      insertRef.current?.(`\n::image{src="${assetSrc(asset.id)}" alt="${safeAlt}"}\n`);
    }
  }, []);

  const onPreviewDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (e.dataTransfer.files?.length) void handleImageFiles(e.dataTransfer.files);
    },
    [handleImageFiles],
  );

  const onPreviewDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (Array.from(e.dataTransfer.items).some((i) => i.kind === 'file')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  }, []);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const files: File[] = [];
      for (const item of Array.from(e.clipboardData.items)) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const f = item.getAsFile();
          if (f) files.push(f);
        }
      }
      if (files.length === 0) return;
      e.preventDefault();
      void handleImageFiles(files);
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [handleImageFiles]);

  const onEditorReady = useCallback((insert: (s: string) => void) => {
    insertRef.current = insert;
  }, []);

  const updateBrand = useCallback((brand: Brand) => setState((s) => ({ ...s, brand })), []);

  if (!loaded) {
    return (
      <div className="editor editor--loading">
        <div className="editor__loading-mark" aria-hidden />
        <span>Loading deck</span>
      </div>
    );
  }

  return (
    <div className="editor">
      <header className="editor__topbar no-print">
        <div className="editor__topbar-left">
          <Link href="/" className="editor__back" aria-label="Back to library">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M9 11L5 7L9 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <div className="editor__topbar-divider" aria-hidden />
          <div className="editor__deck-title-group">
            <DeckTitleField
              value={storedDeck?.title ?? 'Untitled deck'}
              onCommit={async (title) => {
                if (!deckId) return;
                const next = await updateDeck(deckId, { title });
                if (next) setStoredDeck(next);
              }}
              disabled={!deckId}
            />
            <SaveIndicator status={saveStatus} />
          </div>
        </div>

        <div className="editor__topbar-right">
          <Link href="/presets" className="editor__nav-link">
            Presets
          </Link>
          <button
            type="button"
            className={`editor__nav-link editor__nav-link--button ${
              assetsOpen ? 'editor__nav-link--active' : ''
            }`}
            onClick={() => {
              setAssetsOpen((v) => !v);
              setDrawerOpen(false);
            }}
            aria-pressed={assetsOpen}
          >
            Assets
          </button>
          <button
            type="button"
            className={`editor__nav-link editor__nav-link--button ${
              drawerOpen ? 'editor__nav-link--active' : ''
            }`}
            onClick={() => {
              setDrawerOpen((v) => !v);
              setAssetsOpen(false);
            }}
            aria-pressed={drawerOpen}
          >
            Design
          </button>
          {deckId ? (
            <Link
              href={`/d/${deckId}/present`}
              className="editor__nav-link editor__nav-link--button"
              prefetch={false}
            >
              Present
            </Link>
          ) : null}
          <ExportPdf className="editor__cta" />
        </div>
      </header>

      <div
        className="editor__shell no-print"
        style={{ ['--source-width' as string]: `${sourceWidth}px` } as React.CSSProperties}
      >
        <div className="editor__source-pane">
          <SourceEditor value={source} onChange={setSource} onReady={onEditorReady} />
          <InsertMenu onInsert={handleInsert} />
        </div>

        <Resizer
          value={sourceWidth}
          min={SOURCE_WIDTH_MIN}
          max={SOURCE_WIDTH_MAX}
          onChange={setSourceWidth}
          onCommit={commitSourceWidth}
        />

        <div className="editor__preview-pane" onDrop={onPreviewDrop} onDragOver={onPreviewDragOver}>
          {lintWarnings.length > 0 ? (
            <div className="editor__lint" role="status">
              <span className="editor__lint-icon" aria-hidden>
                ⚠
              </span>
              <span className="editor__lint-text">
                {lintWarnings.length === 1
                  ? `${lintWarnings[0].label} contrast is ${lintWarnings[0].ratio} (needs ${lintWarnings[0].needs})`
                  : `${lintWarnings.length} contrast issues — adjust palette or brand colors`}
              </span>
            </div>
          ) : null}
          {result.ok ? (
            <PreviewStage
              deck={result.deck}
              selectedSlide={selectedSlide}
              onSelectSlide={handleSelectSlide}
              onReorderSlide={handleReorderSlide}
            />
          ) : (
            <div className="editor__error">
              <strong>Parse error</strong>
              <pre>{result.error}</pre>
            </div>
          )}
        </div>

        {assetsOpen ? (
          <AssetsDrawer
            onInsert={(snippet) => insertRef.current?.(snippet)}
            onClose={() => setAssetsOpen(false)}
            onUpload={(files) => handleImageFiles(files)}
          />
        ) : null}

        {drawerOpen ? (
          <ThemeDrawer
            presetId={state.presetId}
            paletteId={state.paletteId}
            fontId={state.fontId}
            brand={state.brand}
            onPaletteChange={(paletteId) => setState((s) => ({ ...s, paletteId }))}
            onFontChange={(fontId) => setState((s) => ({ ...s, fontId }))}
            onBrandChange={updateBrand}
            onClose={() => setDrawerOpen(false)}
          />
        ) : null}
      </div>

      <div className="print-only">{result.ok ? <DeckRenderer deck={result.deck} /> : null}</div>
    </div>
  );
}

function DeckTitleField({
  value,
  onCommit,
  disabled,
}: {
  value: string;
  onCommit: (next: string) => void | Promise<void>;
  disabled?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [editing]);

  const commit = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setDraft(value);
    } else if (trimmed !== value) {
      onCommit(trimmed);
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="editor__deck-title editor__deck-title--editing"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') {
            setDraft(value);
            setEditing(false);
          }
        }}
      />
    );
  }

  return (
    <button
      type="button"
      className="editor__deck-title editor__deck-title--button"
      onClick={() => !disabled && setEditing(true)}
      title={disabled ? value : 'Click to rename'}
      disabled={disabled}
    >
      {value}
    </button>
  );
}

function PreviewStage({
  deck,
  selectedSlide,
  onSelectSlide,
  onReorderSlide,
}: {
  deck: Deck;
  selectedSlide: number;
  onSelectSlide: (i: number) => void;
  onReorderSlide: (from: number, to: number) => void;
}) {
  const total = deck.slides.length;
  const safeIndex = Math.min(Math.max(selectedSlide, 0), Math.max(total - 1, 0));
  const visibleDeck = useMemo<Deck>(
    () => ({ ...deck, slides: total === 0 ? [] : [deck.slides[safeIndex]] }),
    [deck, safeIndex, total],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('input, textarea, [contenteditable], .cm-editor, .drawer')) return;
      if (e.key === 'ArrowLeft' && safeIndex > 0) {
        e.preventDefault();
        onSelectSlide(safeIndex - 1);
      } else if (e.key === 'ArrowRight' && safeIndex < total - 1) {
        e.preventDefault();
        onSelectSlide(safeIndex + 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [safeIndex, total, onSelectSlide]);

  return (
    <div className="stage">
      <div className="stage__viewport">
        <div className="stage__slide">
          <DeckRenderer deck={visibleDeck} />
        </div>
      </div>
      <ThumbStrip
        deck={deck}
        selectedIndex={safeIndex}
        onSelect={onSelectSlide}
        onReorder={onReorderSlide}
      />
    </div>
  );
}

function ThumbStrip({
  deck,
  selectedIndex,
  onSelect,
  onReorder,
}: {
  deck: Deck;
  selectedIndex: number;
  onSelect: (i: number) => void;
  onReorder: (from: number, to: number) => void;
}) {
  const total = deck.slides.length;
  const activeRef = useRef<HTMLButtonElement>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const singles = useMemo<Deck[]>(
    () => deck.slides.map((slide) => ({ ...deck, slides: [slide] })),
    [deck],
  );

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [selectedIndex]);

  return (
    <div className="thumb-strip" role="tablist" aria-label="Slide navigation">
      <span className="thumb-strip__counter" aria-live="polite">
        <span className="thumb-strip__counter-num">
          {String(Math.min(selectedIndex + 1, total)).padStart(2, '0')}
        </span>
        <span className="thumb-strip__counter-sep">/</span>
        <span className="thumb-strip__counter-total">{String(total).padStart(2, '0')}</span>
      </span>
      <div className="thumb-strip__rail">
        {deck.slides.map((slide, i) => {
          const active = i === selectedIndex;
          return (
            <Thumb
              key={slide.id}
              ref={active ? activeRef : undefined}
              index={i}
              single={singles[i]}
              active={active}
              dragging={dragIndex === i}
              over={overIndex === i && dragIndex !== null && dragIndex !== i}
              onSelect={onSelect}
              onDragStart={() => setDragIndex(i)}
              onDragEnter={() => {
                if (dragIndex !== null) setOverIndex(i);
              }}
              onDragOver={(e) => {
                if (dragIndex !== null) e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex !== null && dragIndex !== i) onReorder(dragIndex, i);
                setDragIndex(null);
                setOverIndex(null);
              }}
              onDragEnd={() => {
                setDragIndex(null);
                setOverIndex(null);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

type ThumbProps = {
  index: number;
  single: Deck;
  active: boolean;
  dragging?: boolean;
  over?: boolean;
  onSelect: (i: number) => void;
  onDragStart?: () => void;
  onDragEnter?: () => void;
  onDragOver?: (e: React.DragEvent<HTMLButtonElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLButtonElement>) => void;
  onDragEnd?: () => void;
  ref?: React.Ref<HTMLButtonElement>;
};

const Thumb = memo(function Thumb({
  index,
  single,
  active,
  dragging,
  over,
  onSelect,
  onDragStart,
  onDragEnter,
  onDragOver,
  onDrop,
  onDragEnd,
  ref,
}: ThumbProps) {
  const cls = [
    'thumb-strip__item',
    active ? 'thumb-strip__item--active' : '',
    dragging ? 'thumb-strip__item--dragging' : '',
    over ? 'thumb-strip__item--over' : '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={active}
      aria-label={`Slide ${index + 1}`}
      className={cls}
      onClick={() => onSelect(index)}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(index));
        onDragStart?.();
      }}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      <span className="thumb-strip__num">{String(index + 1).padStart(2, '0')}</span>
      <div className="thumb-strip__frame">
        <div className="thumb-strip__scaler">
          <DeckRenderer deck={single} className="deck--thumbnail" />
        </div>
      </div>
    </button>
  );
});

function SaveIndicator({ status }: { status: SaveStatus }) {
  const map: Record<SaveStatus, string> = {
    idle: '',
    saving: 'Saving',
    saved: 'Saved',
    error: 'Failed',
  };
  const text = map[status];
  if (!text) return null;
  return (
    <span className={`save-indicator save-indicator--${status}`} aria-live="polite">
      <span className="save-indicator__dot" aria-hidden />
      {text}
    </span>
  );
}

function Resizer({
  value,
  min,
  max,
  onChange,
  onCommit,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
  onCommit: (next: number) => void;
}) {
  const [dragging, setDragging] = useState(false);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = value;
    setDragging(true);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    let latest = startWidth;
    const onMove = (ev: MouseEvent) => {
      const next = Math.min(max, Math.max(min, startWidth + (ev.clientX - startX)));
      latest = next;
      onChange(next);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      setDragging(false);
      onCommit(latest);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const step = e.shiftKey ? 32 : 8;
    const next = Math.min(max, Math.max(min, value + (e.key === 'ArrowLeft' ? -step : step)));
    onChange(next);
    onCommit(next);
  };

  return (
    <div
      className={`editor__resizer${dragging ? ' editor__resizer--dragging' : ''}`}
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize source pane"
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      onMouseDown={onMouseDown}
      onKeyDown={onKeyDown}
    />
  );
}
