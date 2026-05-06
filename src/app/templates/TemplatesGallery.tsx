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
            <h1 className="templates-page__title">Templates</h1>
            <span className="templates-page__count">
              {TEMPLATE_PRESETS.length} {TEMPLATE_PRESETS.length === 1 ? 'preset' : 'presets'}
            </span>
          </div>
          <p className="templates-page__subtitle">
            Hand-crafted theme combinations. Pick one to create a new deck.
          </p>
        </div>
      </div>

      <main className="templates-page__main">
        <div className="templates-page__grid">
          {TEMPLATE_PRESETS.map((preset) => (
            <TemplateCard key={preset.id} preset={preset} onClick={() => applyTemplate(preset)} />
          ))}
        </div>
      </main>
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
