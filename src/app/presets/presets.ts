import type { Density, Mode } from '@/ir/schema';

/**
 * Typography pair owned by a preset. Three CSS family stacks. Display is for
 * headlines, body is for paragraphs and lists, mono is for figures, code, and
 * eyebrow labels.
 */
export type PresetFonts = {
  display: string;
  body: string;
  mono: string;
};

/**
 * A Preset owns the design surface that is NOT colors: fonts and the default
 * pairing (palette, density, mode). Colors live in the Palette and can be
 * swapped per deck. Each preset typically also ships a CSS file scoped to
 * `[data-preset='<id>']` for any visual signatures (cover treatment, kicker
 * style, custom block overrides, etc.).
 */
export type Preset = {
  id: string;
  name: string;
  vibe: string;
  fonts: PresetFonts;
  paletteId: string;
  density: Density;
  defaultMode: Mode;
  /** Template the gallery uses for the card preview. */
  previewTemplateId: string;
};

export const PRESETS: Preset[] = [
  {
    id: 'dossier-noir',
    name: 'Dossier · Noir',
    vibe: 'Ink-and-champagne editorial. A premium dark-luxe look for client case studies.',
    fonts: {
      display: 'var(--font-instrument), "Instrument Serif", Georgia, serif',
      body: 'var(--font-geist), Geist, system-ui, sans-serif',
      mono: 'var(--font-jetbrains), JetBrains Mono, ui-monospace, monospace',
    },
    paletteId: 'obsidian',
    density: 'airy',
    defaultMode: 'dark',
    previewTemplateId: 'dossier-kitchen-sink',
  },
];

export const DEFAULT_PRESET_ID = PRESETS[0].id;

/**
 * Tolerant lookup: returns the requested preset, or the first preset in the
 * registry if the id is unknown. Lets old decks (which may reference a removed
 * styleId/presetId) keep rendering instead of throwing.
 */
export function getPreset(id: string): Preset {
  return PRESETS.find((p) => p.id === id) ?? PRESETS[0];
}
