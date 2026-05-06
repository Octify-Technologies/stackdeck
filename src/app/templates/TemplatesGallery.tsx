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

import { TEMPLATES, type Template } from './templates';
import { getPreset } from '@/app/presets/presets';

export function TemplatesGallery() {
  const router = useRouter();

  const applyTemplate = async (template: Template) => {
    const preset = getPreset(template.recommendedPresetId);
    if (!preset) {
      window.alert(`Recommended preset "${template.recommendedPresetId}" not found.`);
      return;
    }
    try {
      const deck = await createDeck({
        source: template.seed,
        theme: {
          styleId: preset.styleId,
          paletteId: preset.paletteId,
          density: preset.density,
          mode: preset.defaultMode,
        },
        templateName: template.name,
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
        title="Templates"
        count={`${TEMPLATES.length} ${TEMPLATES.length === 1 ? 'template' : 'templates'}`}
        subtitle="Content scaffolds with example data. Pair with any preset. Edit the markdown after."
      />

      <PageMain>
        <GalleryGrid>
          {TEMPLATES.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onApply={() => applyTemplate(template)}
            />
          ))}
        </GalleryGrid>
      </PageMain>
    </PageShell>
  );
}

function TemplateCard({ template, onApply }: { template: Template; onApply: () => void }) {
  const preset = getPreset(template.recommendedPresetId);

  const previewDeck = useMemo(() => {
    if (!preset) return { ok: false as const, error: 'Preset missing' };
    try {
      const parsed = parseDeck(template.seed, {
        theme: {
          styleId: preset.styleId,
          paletteId: preset.paletteId,
          density: preset.density,
          mode: preset.defaultMode,
        },
      });
      const planned = planDeck(parsed);
      return { ok: true as const, deck: { ...planned, slides: planned.slides.slice(0, 3) } };
    } catch (e) {
      const message = e instanceof ParseError ? e.message : (e as Error).message;
      return { ok: false as const, error: message };
    }
  }, [template, preset]);

  return (
    <button
      type="button"
      className="surface-card preset-card preset-card--multi"
      data-preset={template.recommendedPresetId}
      onClick={onApply}
    >
      <div className="preset-card__preview preset-card__preview--multi">
        <div className="preset-card__scaler preset-card__scaler--multi">
          {previewDeck.ok ? <DeckRenderer deck={previewDeck.deck} /> : null}
        </div>
        <span className="preset-card__chip" data-preset={template.recommendedPresetId}>
          {template.category}
        </span>
        <span className="preset-card__count" aria-label={`${template.slideCount} slides`}>
          {template.slideCount} slides
        </span>
      </div>
      <div className="preset-card__meta">
        <Heading level={3} size="md">
          {template.name}
        </Heading>
        <Caption>{template.vibe}</Caption>
        <div className="preset-card__tags">
          <Label className="preset-card__tag">{template.category}</Label>
          <Label className="preset-card__tag">in {preset?.name ?? 'preset'}</Label>
          <Label className="preset-card__tag">{template.slideCount} slides</Label>
        </div>
      </div>
    </button>
  );
}
