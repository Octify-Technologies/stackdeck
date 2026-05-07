'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

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

import { TEMPLATES, type Template } from '@/app/templates/templates';
import { PRESETS, getPreset, type Preset } from '@/app/presets/presets';

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

type Picked = { template: Template | null; preset: Preset | null };

export function NewDeckGallery() {
  const router = useRouter();
  const [picked, setPicked] = useState<Picked | null>(null);

  const create = async (template: Template | null, preset: Preset) => {
    try {
      const deck = await createDeck({
        source: template?.seed ?? STARTER_MARKDOWN,
        theme: {
          presetId: preset.id,
          paletteId: preset.paletteId,
          fontId: preset.fontId,
        },
        templateName: template?.name,
      });
      router.push(`/d/${deck.id}/edit`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not create deck';
      window.alert(`Could not create the deck: ${message}`);
    }
  };

  if (picked) {
    return (
      <PresetPicker
        picked={picked}
        onCancel={() => setPicked(null)}
        onConfirm={(preset) => create(picked.template, preset)}
      />
    );
  }

  return (
    <PageShell className="presets-page">
      <AppTopbar />

      <PageWorkbar
        back={{ href: '/', label: 'Library', ariaLabel: 'Back to library' }}
        title="Start a deck"
        count={`${TEMPLATES.length + 1} ${TEMPLATES.length + 1 === 1 ? 'option' : 'options'}`}
        subtitle="Pick a template (the content) or start blank. Next step is the preset (the design)."
      />

      <PageMain>
        <GalleryGrid>
          <BlankCard
            onClick={() => {
              const defaultPreset = PRESETS[0];
              if (!defaultPreset) return;
              setPicked({ template: null, preset: null });
            }}
          />
          {TEMPLATES.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onClick={() => setPicked({ template, preset: null })}
            />
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
      className="surface-card surface-card--dashed preset-card preset-card--blank"
      onClick={onClick}
    >
      <div className="preset-card__preview preset-card__preview--blank">
        <span aria-hidden>+</span>
      </div>
      <div className="preset-card__meta">
        <Heading level={3} size="md">
          Blank deck
        </Heading>
        <Caption>Start from scratch. Pick a preset on the next step.</Caption>
      </div>
    </button>
  );
}

function TemplateCard({ template, onClick }: { template: Template; onClick: () => void }) {
  const preset = getPreset(template.recommendedPresetId);

  const previewDeck = useMemo(() => {
    if (!preset) return { ok: false as const, error: 'Preset missing' };
    try {
      const parsed = parseDeck(template.seed, {
        theme: {
          presetId: preset.id,
          paletteId: preset.paletteId,
          fontId: preset.fontId,
        },
      });
      const planned = planDeck(parsed);
      return { ok: true as const, deck: { ...planned, slides: planned.slides.slice(0, 1) } };
    } catch (e) {
      const message = e instanceof ParseError ? e.message : (e as Error).message;
      return { ok: false as const, error: message };
    }
  }, [template, preset]);

  return (
    <button
      type="button"
      className="surface-card preset-card"
      data-preset={template.recommendedPresetId}
      onClick={onClick}
    >
      <div className="preset-card__preview">
        <div className="preset-card__scaler">
          {previewDeck.ok ? <DeckRenderer deck={previewDeck.deck} /> : null}
        </div>
        <span className="preset-card__chip" data-preset={template.recommendedPresetId}>
          {template.category}
        </span>
      </div>
      <div className="preset-card__meta">
        <Heading level={3} size="md">
          {template.name}
        </Heading>
        <Caption>{template.vibe}</Caption>
        <div className="preset-card__tags">
          <Label className="preset-card__tag">{template.category}</Label>
          <Label className="preset-card__tag">{template.slideCount} slides</Label>
        </div>
      </div>
    </button>
  );
}

function PresetPicker({
  picked,
  onCancel,
  onConfirm,
}: {
  picked: Picked;
  onCancel: () => void;
  onConfirm: (preset: Preset) => void;
}) {
  return (
    <PageShell className="presets-page">
      <AppTopbar />

      <PageWorkbar
        back={{ href: '#', label: 'Back', ariaLabel: 'Back to template choice' }}
        title={picked.template ? `${picked.template.name} → pick a design` : 'Pick a design'}
        count={`${PRESETS.length} ${PRESETS.length === 1 ? 'preset' : 'presets'}`}
        subtitle={
          picked.template ? 'Each preset re-skins the same content.' : 'Blank deck. Pick a design.'
        }
      />

      <PageMain>
        <GalleryGrid>
          {PRESETS.map((preset) => (
            <PresetChoiceCard
              key={preset.id}
              preset={preset}
              template={picked.template}
              onConfirm={() => onConfirm(preset)}
            />
          ))}
        </GalleryGrid>
        <button
          type="button"
          onClick={onCancel}
          style={{
            margin: '24px auto',
            display: 'block',
            background: 'transparent',
            border: 0,
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          ← Pick a different template
        </button>
      </PageMain>
    </PageShell>
  );
}

function PresetChoiceCard({
  preset,
  template,
  onConfirm,
}: {
  preset: Preset;
  template: Template | null;
  onConfirm: () => void;
}) {
  const seed = template?.seed ?? STARTER_MARKDOWN;

  const previewDeck = useMemo(() => {
    try {
      const parsed = parseDeck(seed, {
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
  }, [preset, seed]);

  return (
    <button
      type="button"
      className="surface-card preset-card preset-card--multi"
      data-preset={preset.id}
      onClick={onConfirm}
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
