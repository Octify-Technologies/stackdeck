import type { Density, Mode } from '@/ir/schema';

/**
 * A Preset is a visual design only. Style + palette + density + mode + the
 * default mode the gallery should render in. NO content. Combine with a
 * Template (or the blank starter) to spawn a deck.
 */
export type Preset = {
  id: string;
  name: string;
  vibe: string;
  styleId: string;
  paletteId: string;
  density: Density;
  defaultMode: Mode;
  /** Template the preset uses for its gallery preview render. */
  previewTemplateId: string;
};

export const PRESETS: Preset[] = [];

export function getPreset(id: string): Preset | undefined {
  return PRESETS.find((p) => p.id === id);
}
