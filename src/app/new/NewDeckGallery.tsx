'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

import { ParseError, parseDeck } from '@/ir/parse';
import { planDeck } from '@/ir/plan';
import { createDeck } from '@/storage/deck-store';
import { DeckRenderer } from '@/render/DeckRenderer';
import { AppTopbar } from '@/components/AppTopbar';

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
    <div className="templates-page">
      <AppTopbar />

      <div className="templates-page__workbar">
        <div className="templates-page__bar-inner">
          <div className="templates-page__workbar-left">
            <Link href="/" className="templates-page__back" aria-label="Back to library">
              <span className="templates-page__back-arrow" aria-hidden>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M9 11L5 7L9 3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              Library
            </Link>
            <h1 className="templates-page__title">Start a deck</h1>
            <span className="templates-page__count">
              {totalChoices} {totalChoices === 1 ? 'option' : 'options'}
            </span>
          </div>
          <p className="templates-page__subtitle">
            Each template is a starter deck plus a theme. Change colors, fonts, and content after.
          </p>
        </div>
      </div>

      <main className="templates-page__main">
        <div className="templates-page__grid">
          <BlankCard onClick={() => create(BLANK_TEMPLATE)} />
          {TEMPLATE_PRESETS.map((preset) => (
            <TemplateCard key={preset.id} preset={preset} onClick={() => create(preset)} />
          ))}
        </div>
      </main>
    </div>
  );
}

function BlankCard({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="template-card template-card--blank" onClick={onClick}>
      <div className="template-card__preview template-card__preview--blank">
        <span aria-hidden>+</span>
      </div>
      <div className="template-card__meta">
        <h3 className="template-card__name">Blank deck</h3>
        <p className="template-card__vibe">Start from scratch. Modern style by default.</p>
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
    <button type="button" className="template-card" data-template={templateAttr} onClick={onClick}>
      <div className="template-card__preview">
        <div className="template-card__scaler">
          {previewDeck.ok ? <DeckRenderer deck={previewDeck.deck} /> : null}
        </div>
      </div>
      <div className="template-card__meta">
        <h3 className="template-card__name">{preset.name}</h3>
        <p className="template-card__vibe">{preset.vibe}</p>
        <div className="template-card__tags">
          <span className="template-card__tag">{preset.styleId}</span>
          <span className="template-card__tag">{preset.paletteId}</span>
          <span className="template-card__tag">{preset.density}</span>
          <span className="template-card__tag">{preset.mode}</span>
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
