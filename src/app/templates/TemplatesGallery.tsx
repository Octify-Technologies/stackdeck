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

import { SAMPLE_MARKDOWN } from '@/editor/sample-deck';

import { TEMPLATE_PRESETS, type TemplatePreset } from './template-presets';

export function TemplatesGallery() {
  const router = useRouter();

  const applyTemplate = async (preset: TemplatePreset) => {
    const deck = await createDeck({
      source: SAMPLE_MARKDOWN,
      theme: {
        styleId: preset.styleId,
        paletteId: preset.paletteId,
        density: preset.density,
        mode: preset.mode,
      },
      templateName: preset.name,
    });
    router.push(`/d/${deck.id}/edit`);
  };

  return (
    <PageShell className="templates-page">
      <AppTopbar />

      <PageWorkbar
        back={{ href: '/', label: 'Library', ariaLabel: 'Back to library' }}
        title="Templates"
        count={`${TEMPLATE_PRESETS.length} ${TEMPLATE_PRESETS.length === 1 ? 'preset' : 'presets'}`}
        subtitle="Hand-crafted theme combinations. Pick one to create a new deck."
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
      const parsed = parseDeck(SAMPLE_MARKDOWN, {
        theme: {
          styleId: preset.styleId,
          paletteId: preset.paletteId,
          density: preset.density,
          mode: preset.mode,
        },
      });
      const planned = planDeck(parsed);
      return { ok: true as const, deck: { ...planned, slides: planned.slides.slice(0, 1) } };
    } catch (e) {
      const message = e instanceof ParseError ? e.message : (e as Error).message;
      return { ok: false as const, error: message };
    }
  }, [preset]);

  const templateAttr = templateSlug(preset.id);

  return (
    <button
      type="button"
      className="surface-card template-card"
      data-template={templateAttr}
      onClick={onClick}
    >
      <div className="template-card__preview">
        <div className="template-card__scaler">
          {previewDeck.ok ? <DeckRenderer deck={previewDeck.deck} /> : null}
        </div>
        <span className="template-card__chip" data-template={templateAttr}>
          {preset.name}
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

function templateSlug(id: string): 'pitch' | 'editorial' | 'other' {
  if (id.includes('pitch')) return 'pitch';
  if (id.includes('editorial')) return 'editorial';
  return 'other';
}
