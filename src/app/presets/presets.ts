/**
 * A Preset is the design surface: a hand-designed deck embedded as code in
 * this repo. To register a new preset, ship its bespoke JSX components,
 * scoped CSS, palette, and curated demo template, then add the record here.
 */
export type Preset = {
  id: string;
  name: string;
  vibe: string;
  paletteId: string;
  fontId: string;
  previewTemplateId: string;
};

export const PRESETS: Preset[] = [
  {
    id: 'dossier',
    name: 'Dossier Noir',
    vibe: 'Editorial case study, dark mode. Warm-paper near-black ground, italic Fraunces display, hairline rules, mono labels. Reads like a financial report crossed with a Monocle case feature.',
    paletteId: 'dossier',
    fontId: 'fraunces',
    previewTemplateId: 'dossier-case-study',
  },
];

export const DEFAULT_PRESET_ID = 'dossier';

export function getPreset(id: string): Preset | undefined {
  return PRESETS.find((p) => p.id === id);
}
