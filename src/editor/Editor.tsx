'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ParseError, parseDeck } from '@/ir/parse';
import { planDeck } from '@/ir/plan';
import type { Brand, Density, Mode, ThemeRef } from '@/ir/schema';
import { getDeck, type StoredDeck, updateDeck } from '@/storage/deck-store';
import { DeckRenderer } from '@/render/DeckRenderer';
import { ExportPdf } from '@/render/ExportPdf';
import { allPalettes, allStyles } from '@/themes/registry';

import { InsertMenu } from './InsertMenu';
import { SAMPLE_MARKDOWN } from './sample-deck';
import { SlideThumbnailList } from './SlideThumbnailList';
import { SourceEditor } from './SourceEditor';
import { ThemeDrawer } from './ThemeDrawer';

type EditorState = {
  styleId: string;
  paletteId: string;
  density: Density;
  mode: Mode;
  brand: Brand;
};

const DEFAULT_STATE: EditorState = {
  styleId: allStyles[0].id,
  paletteId: allPalettes[0].id,
  density: 'comfortable',
  mode: 'light',
  brand: {},
};

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

type Props = {
  deckId?: string;
};

export function Editor({ deckId }: Props) {
  const router = useRouter();
  const [source, setSource] = useState(SAMPLE_MARKDOWN);
  const [state, setState] = useState<EditorState>(DEFAULT_STATE);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [loaded, setLoaded] = useState(!deckId);
  const [storedDeck, setStoredDeck] = useState<StoredDeck | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const insertRef = useRef<((s: string) => void) | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!deckId) return;
    let cancelled = false;
    getDeck(deckId).then((deck) => {
      if (cancelled) return;
      if (!deck) {
        router.replace('/');
        return;
      }
      setStoredDeck(deck);
      setSource(deck.source);
      setState({
        styleId: deck.theme.styleId,
        paletteId: deck.theme.paletteId,
        density: deck.theme.density,
        mode: deck.theme.mode,
        brand: deck.brand ?? {},
      });
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [deckId, router]);

  useEffect(() => {
    if (!deckId || !loaded) return;
    setSaveStatus('saving');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        const next = await updateDeck(deckId, {
          source,
          theme: {
            styleId: state.styleId,
            paletteId: state.paletteId,
            density: state.density,
            mode: state.mode,
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
      styleId: state.styleId,
      paletteId: state.paletteId,
      density: state.density,
      mode: state.mode,
    }),
    [state.styleId, state.paletteId, state.density, state.mode],
  );

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
    if (typeof document === 'undefined') return;
    const frame = document.querySelector(`[data-slide-index='${index}']`)?.closest('.slide-frame');
    if (frame) frame.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const handleInsert = useCallback((snippet: string) => {
    insertRef.current?.(snippet);
  }, []);

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
            <span className="editor__deck-title">{storedDeck?.title ?? 'Untitled deck'}</span>
            <SaveIndicator status={saveStatus} />
          </div>
        </div>

        <div className="editor__topbar-center">
          <span className="editor__crumb">
            <span className="editor__crumb-label">Style</span>
            <span className="editor__crumb-value">{state.styleId}</span>
          </span>
          <span className="editor__crumb-sep" aria-hidden>
            ·
          </span>
          <span className="editor__crumb">
            <span className="editor__crumb-label">Palette</span>
            <span className="editor__crumb-value">{state.paletteId}</span>
          </span>
          <span className="editor__crumb-sep" aria-hidden>
            ·
          </span>
          <span className="editor__crumb editor__crumb--mode">{state.mode}</span>
        </div>

        <div className="editor__topbar-right">
          <InsertMenu onInsert={handleInsert} />
          <Link href="/templates" className="editor__nav-link">
            Templates
          </Link>
          <button
            type="button"
            className={`editor__nav-link editor__nav-link--button ${
              drawerOpen ? 'editor__nav-link--active' : ''
            }`}
            onClick={() => setDrawerOpen((v) => !v)}
            aria-pressed={drawerOpen}
          >
            Design
          </button>
          <ExportPdf className="editor__cta" />
        </div>
      </header>

      <div className="editor__shell no-print">
        {result.ok ? (
          <SlideThumbnailList
            deck={result.deck}
            selectedIndex={selectedSlide}
            onSelect={handleSelectSlide}
          />
        ) : (
          <aside className="thumb-list thumb-list--empty" aria-label="Slide navigation" />
        )}

        <div className="editor__source-pane">
          <SourceEditor value={source} onChange={setSource} onReady={onEditorReady} />
        </div>

        <div className="editor__preview-pane">
          {result.ok ? (
            <DeckRenderer deck={result.deck} />
          ) : (
            <div className="editor__error">
              <strong>Parse error</strong>
              <pre>{result.error}</pre>
            </div>
          )}
        </div>

        {drawerOpen ? (
          <ThemeDrawer
            styleId={state.styleId}
            paletteId={state.paletteId}
            density={state.density}
            mode={state.mode}
            brand={state.brand}
            onStyleChange={(styleId) => setState((s) => ({ ...s, styleId }))}
            onPaletteChange={(paletteId) => setState((s) => ({ ...s, paletteId }))}
            onDensityChange={(density) => setState((s) => ({ ...s, density }))}
            onModeChange={(mode) => setState((s) => ({ ...s, mode }))}
            onBrandChange={updateBrand}
            onClose={() => setDrawerOpen(false)}
          />
        ) : null}
      </div>

      <div className="print-only">{result.ok ? <DeckRenderer deck={result.deck} /> : null}</div>
    </div>
  );
}

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
