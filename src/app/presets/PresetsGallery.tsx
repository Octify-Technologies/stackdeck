'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

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

  const applyPreset = async (preset: Preset) => {
    const tpl = getTemplate(preset.previewTemplateId);
    try {
      const deck = await createDeck({
        source: tpl?.seed ?? '# Blank deck\n',
        theme: {
          presetId: preset.id,
          paletteId: preset.paletteId,
          fontId: preset.fontId,
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
            <PresetCard key={preset.id} preset={preset} onApply={() => applyPreset(preset)} />
          ))}
        </GalleryGrid>
      </PageMain>
    </PageShell>
  );
}

function PresetCard({ preset, onApply }: { preset: Preset; onApply: () => void }) {
  const previewTemplate = getTemplate(preset.previewTemplateId);

  const previewDeck = useMemo(() => {
    if (!previewTemplate) return { ok: false as const, error: 'Preview template missing' };
    try {
      const parsed = parseDeck(previewTemplate.seed, {
        theme: {
          presetId: preset.id,
          paletteId: preset.paletteId,
          fontId: preset.fontId,
        },
      });
      const planned = planDeck(parsed);
      return { ok: true as const, deck: { ...planned, slides: planned.slides.slice(0, 3) } };
    } catch (e) {
      const message = e instanceof ParseError ? e.message : (e as Error).message;
      return { ok: false as const, error: message };
    }
  }, [preset, previewTemplate]);

  return (
    <button
      type="button"
      className="surface-card preset-card preset-card--multi"
      data-preset={preset.id}
      onClick={onApply}
    >
      <div className="preset-card__preview preset-card__preview--multi">
        <div className="preset-card__scaler preset-card__scaler--multi">
          {previewDeck.ok ? <DeckRenderer deck={previewDeck.deck} /> : null}
        </div>
        <span className="preset-card__chip" data-preset={preset.id}>
          design
        </span>
      </div>
      <div className="preset-card__meta">
        <Heading level={3} size="md">
          {preset.name}
        </Heading>
        <Caption>{preset.vibe}</Caption>
        <div className="preset-card__tags">
          <Label className="preset-card__tag">{preset.paletteId}</Label>
          <Label className="preset-card__tag">{preset.fontId}</Label>
        </div>
      </div>
    </button>
  );
}
