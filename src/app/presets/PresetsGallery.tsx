'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import type { Mode } from '@/ir/schema';
import { ParseError, parseDeck } from '@/ir/parse';
import { planDeck } from '@/ir/plan';
import { createDeck } from '@/storage/deck-store';
import { DeckRenderer } from '@/render/DeckRenderer';
import {
  AppTopbar,
  Caption,
  GalleryGrid,
  Heading,
  Label,
  PageMain,
  PageWorkbar,
  PageShell,
} from '@/components';

import { PRESETS, type Preset } from './presets';
import { getTemplate } from '@/app/templates/templates';

export function PresetsGallery() {
  const router = useRouter();

  const applyPreset = async (preset: Preset, mode: Mode) => {
    const tpl = getTemplate(preset.previewTemplateId);
    try {
      const deck = await createDeck({
        source: tpl?.seed ?? '# Blank deck\n',
        theme: {
          styleId: preset.styleId,
          paletteId: preset.paletteId,
          density: preset.density,
          mode,
        },
        templateName: preset.name,
      });
      router.push(`/d/${deck.id}/edit`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not create deck';
      window.alert(`Could not create the deck: ${message}`);
    }
  };

  return (
    <PageShell className="presets-page">
      <AppTopbar />

      <PageWorkbar
        back={{ href: '/', label: 'Library', ariaLabel: 'Back to library' }}
        title="Presets"
        count={`${PRESETS.length} ${PRESETS.length === 1 ? 'design' : 'designs'}`}
        subtitle="Visual designs. Pick a look. Pair with a template at /templates, or spawn a starter deck right from here."
      />

      <PageMain>
        <GalleryGrid>
          {PRESETS.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              onApply={(mode) => applyPreset(preset, mode)}
            />
          ))}
        </GalleryGrid>
      </PageMain>
    </PageShell>
  );
}

function PresetCard({ preset, onApply }: { preset: Preset; onApply: (mode: Mode) => void }) {
  const [previewMode, setPreviewMode] = useState<Mode>(preset.defaultMode);
  const previewTemplate = getTemplate(preset.previewTemplateId);

  const previewDeck = useMemo(() => {
    if (!previewTemplate) return { ok: false as const, error: 'Preview template missing' };
    try {
      const parsed = parseDeck(previewTemplate.seed, {
        theme: {
          styleId: preset.styleId,
          paletteId: preset.paletteId,
          density: preset.density,
          mode: previewMode,
        },
      });
      const planned = planDeck(parsed);
      return { ok: true as const, deck: { ...planned, slides: planned.slides.slice(0, 3) } };
    } catch (e) {
      const message = e instanceof ParseError ? e.message : (e as Error).message;
      return { ok: false as const, error: message };
    }
  }, [preset, previewMode, previewTemplate]);

  const presetAttr = preset.id;
  const stop = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <button
      type="button"
      className="surface-card preset-card preset-card--multi"
      data-preset={presetAttr}
      onClick={() => onApply(previewMode)}
    >
      <div className="preset-card__preview preset-card__preview--multi">
        <div className="preset-card__scaler preset-card__scaler--multi">
          {previewDeck.ok ? <DeckRenderer deck={previewDeck.deck} /> : null}
        </div>
        <div
          className="preset-card__mode-toggle"
          onClick={stop}
          role="group"
          aria-label="Preview mode"
        >
          <button
            type="button"
            className="preset-card__mode-btn"
            data-active={previewMode === 'light'}
            onClick={(e) => {
              stop(e);
              setPreviewMode('light');
            }}
            aria-pressed={previewMode === 'light'}
          >
            Light
          </button>
          <button
            type="button"
            className="preset-card__mode-btn"
            data-active={previewMode === 'dark'}
            onClick={(e) => {
              stop(e);
              setPreviewMode('dark');
            }}
            aria-pressed={previewMode === 'dark'}
          >
            Dark
          </button>
        </div>
        <span className="preset-card__chip" data-preset={presetAttr}>
          design
        </span>
      </div>
      <div className="preset-card__meta">
        <Heading level={3} size="md">
          {preset.name}
        </Heading>
        <Caption>{preset.vibe}</Caption>
        <div className="preset-card__tags">
          <Label className="preset-card__tag">{preset.styleId}</Label>
          <Label className="preset-card__tag">{preset.paletteId}</Label>
          <Label className="preset-card__tag">{preset.density}</Label>
          <Label className="preset-card__tag">{previewMode}</Label>
        </div>
      </div>
    </button>
  );
}
