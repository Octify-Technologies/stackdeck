'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ParseError, parseDeck } from '@/ir/parse';
import { planDeck } from '@/ir/plan';
import type { Brand, Density, Mode, ThemeRef } from '@/ir/schema';
import { loadLastTheme, saveLastTheme } from '@/lib/storage';
import { DeckRenderer } from '@/render/DeckRenderer';
import { ExportPdf } from '@/render/ExportPdf';
import { allPalettes, allStyles } from '@/themes/registry';

import { SAMPLE_MARKDOWN } from './sample-deck';
import { SlideThumbnailList } from './SlideThumbnailList';
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

export function Editor() {
  const [source, setSource] = useState(SAMPLE_MARKDOWN);
  const [state, setState] = useState<EditorState>(DEFAULT_STATE);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState(0);

  const sourceRef = useRef<HTMLTextAreaElement>(null);

  // Restore last-used theme from localStorage on mount.
  useEffect(() => {
    const restored = loadLastTheme<EditorState>();
    if (restored) setState((prev) => ({ ...prev, ...restored }));
  }, []);

  // Persist whenever theme state changes.
  useEffect(() => {
    saveLastTheme(state);
  }, [state]);

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

  const updateBrand = useCallback((brand: Brand) => setState((s) => ({ ...s, brand })), []);

  return (
    <div className="editor">
      <header className="editor__topbar no-print">
        <div className="editor__brand">
          <Link href="/" className="editor__brand-link">
            stackdeck
          </Link>
          <span className="editor__brand-pill">v0.2</span>
        </div>

        <div className="editor__topbar-actions">
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
          <textarea
            ref={sourceRef}
            className="editor__source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            spellCheck={false}
            aria-label="Markdown source"
          />
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
