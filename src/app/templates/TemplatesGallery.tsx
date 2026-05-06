'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

import { ParseError, parseDeck } from '@/ir/parse';
import { planDeck } from '@/ir/plan';
import { createDeck } from '@/storage/deck-store';
import { DeckRenderer } from '@/render/DeckRenderer';

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
    <div className="templates-page">
      <header className="templates-page__topbar">
        <Link href="/" className="templates-page__brand">
          stackdeck
        </Link>
      </header>
      <header className="templates-page__header">
        <Link href="/" className="templates-page__back" aria-label="Back to library">
          Library
        </Link>
        <h1 className="templates-page__title">Templates</h1>
        <p className="templates-page__subtitle">
          {TEMPLATE_PRESETS.length} hand-crafted theme combinations. Pick one to create a new deck.
        </p>
      </header>

      <div className="templates-page__grid">
        {TEMPLATE_PRESETS.map((preset) => (
          <TemplateCard key={preset.id} preset={preset} onClick={() => applyTemplate(preset)} />
        ))}
      </div>
    </div>
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

  return (
    <button type="button" className="template-card" onClick={onClick}>
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
