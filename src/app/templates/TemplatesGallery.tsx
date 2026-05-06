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
  PageShell,
  PageWorkbar,
} from '@/components';

import { TEMPLATE_PRESETS, type TemplatePreset } from './template-presets';

export function TemplatesGallery() {
  const router = useRouter();

  const applyTemplate = async (preset: TemplatePreset) => {
    try {
      const deck = await createDeck({
        source: preset.seed,
        theme: {
          styleId: preset.styleId,
          paletteId: preset.paletteId,
          density: preset.density,
          mode: preset.mode,
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
    <PageShell className="templates-page">
      <AppTopbar />

      <PageWorkbar
        back={{ href: '/', label: 'Library', ariaLabel: 'Back to library' }}
        title="Templates"
        count={`${TEMPLATE_PRESETS.length} ${TEMPLATE_PRESETS.length === 1 ? 'preset' : 'presets'}`}
        subtitle="Premium starting points. Each is a fully composed deck, ready to customize."
      />

      <PageMain>
        <GalleryGrid>
          {TEMPLATE_PRESETS.map((preset) => (
            <TemplateCard key={preset.id} preset={preset} onClick={() => applyTemplate(preset)} />
          ))}
        </GalleryGrid>
      </PageMain>
    </PageShell>
  );
}

function TemplateCard({ preset, onClick }: { preset: TemplatePreset; onClick: () => void }) {
  const previewDeck = useMemo(() => {
    try {
      const parsed = parseDeck(preset.seed, {
        theme: {
          styleId: preset.styleId,
          paletteId: preset.paletteId,
          density: preset.density,
          mode: preset.mode,
        },
      });
      const planned = planDeck(parsed);
      return { ok: true as const, deck: { ...planned, slides: planned.slides.slice(0, 3) } };
    } catch (e) {
      const message = e instanceof ParseError ? e.message : (e as Error).message;
      return { ok: false as const, error: message };
    }
  }, [preset]);

  const templateAttr = templateSlug(preset.id);

  return (
    <button
      type="button"
      className="surface-card template-card template-card--multi"
      data-template={templateAttr}
      onClick={onClick}
    >
      <div className="template-card__preview template-card__preview--multi">
        <div className="template-card__scaler template-card__scaler--multi">
          {previewDeck.ok ? <DeckRenderer deck={previewDeck.deck} /> : null}
        </div>
        <span className="template-card__chip" data-template={templateAttr}>
          {preset.category}
        </span>
        <span className="template-card__count" aria-label={`${preset.slideCount} slides`}>
          {preset.slideCount} slides
        </span>
      </div>
      <div className="template-card__meta">
        <Heading level={3} size="md">
          {preset.name}
        </Heading>
        <Caption>{preset.vibe}</Caption>
        <div className="template-card__tags">
          <Label className="template-card__tag">{preset.styleId}</Label>
          <Label className="template-card__tag">{preset.paletteId}</Label>
          <Label className="template-card__tag">{preset.density}</Label>
          <Label className="template-card__tag">{preset.mode}</Label>
        </div>
      </div>
    </button>
  );
}

function templateSlug(id: string): 'case-study-pro' | 'case-study-editorial' | 'other' {
  if (id === 'case-study-pro') return 'case-study-pro';
  if (id === 'case-study-editorial') return 'case-study-editorial';
  return 'other';
}
