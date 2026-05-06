'use client';

import { useMemo, useState } from 'react';

import { ParseError, parseDeck } from '@/ir/parse';
import { planDeck } from '@/ir/plan';
import { DENSITIES, MODES, type Density, type Mode, type ThemeRef } from '@/ir/schema';
import { DeckRenderer } from '@/render/DeckRenderer';
import { ExportPdf } from '@/render/ExportPdf';
import { allPalettes, allStyles } from '@/themes/registry';

import { SAMPLE_MARKDOWN } from './sample-deck';

/**
 * The single-page editor: markdown source on the left, rendered deck on the right,
 * theme controls in the toolbar. Parses and plans on every keystroke.
 */
export function Editor() {
  const [source, setSource] = useState(SAMPLE_MARKDOWN);
  const [styleId, setStyleId] = useState(allStyles[0].id);
  const [paletteId, setPaletteId] = useState(allPalettes[0].id);
  const [density, setDensity] = useState<Density>('comfortable');
  const [mode, setMode] = useState<Mode>('light');

  const theme: ThemeRef = useMemo(
    () => ({ styleId, paletteId, density, mode }),
    [styleId, paletteId, density, mode],
  );

  const result = useMemo(() => {
    try {
      const parsed = parseDeck(source, { theme });
      const planned = planDeck(parsed);
      return { ok: true as const, deck: planned };
    } catch (e) {
      const message = e instanceof ParseError ? e.message : (e as Error).message;
      return { ok: false as const, error: message };
    }
  }, [source, theme]);

  return (
    <div className="editor">
      <header className="editor__toolbar no-print">
        <div className="editor__toolbar-group">
          <h1 className="editor__brand">stackdeck</h1>
        </div>

        <div className="editor__toolbar-group">
          <label className="editor__field">
            <span>Style</span>
            <select value={styleId} onChange={(e) => setStyleId(e.target.value)}>
              {allStyles.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>

          <label className="editor__field">
            <span>Palette</span>
            <select value={paletteId} onChange={(e) => setPaletteId(e.target.value)}>
              {allPalettes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <label className="editor__field">
            <span>Density</span>
            <select value={density} onChange={(e) => setDensity(e.target.value as Density)}>
              {DENSITIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>

          <label className="editor__field">
            <span>Mode</span>
            <select value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
              {MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="editor__toolbar-group">
          <ExportPdf className="editor__export-button" />
        </div>
      </header>

      <main className="editor__split no-print">
        <textarea
          className="editor__source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          spellCheck={false}
          aria-label="Markdown source"
        />

        <div className="editor__preview">
          {result.ok ? (
            <DeckRenderer deck={result.deck} />
          ) : (
            <div className="editor__error">
              <strong>Parse error</strong>
              <pre>{result.error}</pre>
            </div>
          )}
        </div>
      </main>

      <div className="print-only">{result.ok ? <DeckRenderer deck={result.deck} /> : null}</div>
    </div>
  );
}
