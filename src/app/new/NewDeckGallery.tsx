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
import { TEMPLATE_PRESETS, type TemplatePreset } from '@/app/templates/template-presets';

const STARTER_MARKDOWN = `---
title: New deck
---

::cover
# A new beginning.
Replace this with your own title.
::

::slide

# Highlights

- First key point
- Second key point
- Third key point

::slide

::stats
::stat{value="100%" label="Awesome"}
::stat{value="Now" label="Time to ship"}
::

::slide

::quote.big
> The best way to predict the future is to invent it.
> -- Alan Kay
::
`;

const BLANK_TEMPLATE: TemplatePreset = {
  id: 'blank',
  name: 'Blank',
  vibe: 'Start from scratch',
  styleId: 'modern',
  paletteId: 'electric',
  density: 'comfortable',
  mode: 'light',
};

export function NewDeckGallery() {
  const router = useRouter();

  const create = async (preset: TemplatePreset) => {
    const deck = await createDeck({
      source: STARTER_MARKDOWN,
      theme: {
        styleId: preset.styleId,
        paletteId: preset.paletteId,
        density: preset.density,
        mode: preset.mode,
      },
      templateName: preset.id === 'blank' ? undefined : preset.name,
    });
    router.push(`/d/${deck.id}/edit`);
  };

  const totalChoices = TEMPLATE_PRESETS.length + 1;

  return (
    <PageShell className="templates-page">
      <AppTopbar />

      <PageWorkbar
        back={{ href: '/', label: 'Library', ariaLabel: 'Back to library' }}
        title="Start a deck"
        count={`${totalChoices} ${totalChoices === 1 ? 'option' : 'options'}`}
        subtitle="Each template is a starter deck plus a theme. Change colors, fonts, and content after."
      />

      <PageMain>
        <GalleryGrid>
          <BlankCard onClick={() => create(BLANK_TEMPLATE)} />
          {TEMPLATE_PRESETS.map((preset) => (
            <TemplateCard key={preset.id} preset={preset} onClick={() => create(preset)} />
          ))}
        </GalleryGrid>
      </PageMain>
    </PageShell>
  );
}

function BlankCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="surface-card surface-card--dashed template-card template-card--blank"
      onClick={onClick}
    >
      <div className="template-card__preview template-card__preview--blank">
        <span aria-hidden>+</span>
      </div>
      <div className="template-card__meta">
        <Heading level={3} size="md">
          Blank deck
        </Heading>
        <Caption>Start from scratch. Modern style by default.</Caption>
      </div>
    </button>
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
