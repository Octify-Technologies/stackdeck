import type { Density, Mode } from '@/ir/schema';

export type TemplatePreset = {
  id: string;
  name: string;
  vibe: string;
  styleId: string;
  paletteId: string;
  density: Density;
  mode: Mode;
};

/**
 * Two solid, distinctly opinionated starting points. Different aesthetics so
 * they cover the most common use cases without overwhelming the gallery.
 *
 * - Pitch Deck (Modern + Electric, light, comfortable): sharp, professional,
 *   investor-ready. The default for product, sales, fundraising.
 * - Editorial (Editorial + Mono, light, airy): magazine-grade narrative,
 *   long-form storytelling, year-in-review, retrospective.
 */
export const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: 'pitch-deck',
    name: 'Pitch Deck',
    vibe: 'Sharp, professional, investor-ready',
    styleId: 'modern',
    paletteId: 'electric',
    density: 'comfortable',
    mode: 'light',
  },
  {
    id: 'editorial',
    name: 'Editorial',
    vibe: 'Magazine-grade narrative, calm and considered',
    styleId: 'editorial',
    paletteId: 'mono',
    density: 'airy',
    mode: 'light',
  },
];
