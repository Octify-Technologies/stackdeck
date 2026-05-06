/**
 * A Preset is the design surface: a hand-designed deck embedded as code in
 * this repo. Empty registry. Add a new preset by shipping its bespoke JSX
 * components, scoped CSS, palette, and curated demo template, then register
 * the record here.
 */
export type Preset = {
  id: string;
  name: string;
  vibe: string;
  paletteId: string;
  fontId: string;
  previewTemplateId: string;
};

export const PRESETS: Preset[] = [];

export const DEFAULT_PRESET_ID = '';

export function getPreset(id: string): Preset | undefined {
  return PRESETS.find((p) => p.id === id);
}
