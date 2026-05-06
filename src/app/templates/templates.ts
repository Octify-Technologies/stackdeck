import { dossierCaseStudySeed } from './seeds/dossier-case-study';
import { dossierKitchenSinkSeed } from './seeds/dossier-kitchen-sink';

export type TemplateCategory = 'case-study' | 'pitch' | 'sales' | 'internal';

/**
 * A Template is content data: the markdown directives for a starter deck. It
 * is independent of the visual design (Preset). Pair a Template with a Preset
 * at deck-creation time. recommendedPresetId is the preset the gallery uses
 * to render the preview thumbnail and the default when spawning a deck.
 */
export type Template = {
  id: string;
  name: string;
  vibe: string;
  category: TemplateCategory;
  seed: string;
  slideCount: number;
  recommendedPresetId: string;
};

export const TEMPLATES: Template[] = [
  {
    id: 'northwind-case-study',
    name: 'Northwind, six-week engagement',
    vibe: 'A premium client case study told as an editorial dossier.',
    category: 'case-study',
    seed: dossierCaseStudySeed,
    slideCount: 8,
    recommendedPresetId: 'dossier-noir',
  },
  {
    id: 'dossier-kitchen-sink',
    name: 'Dossier · kitchen sink',
    vibe: 'Every directive in one deck. Use this to iterate on the Dossier preset.',
    category: 'case-study',
    seed: dossierKitchenSinkSeed,
    slideCount: 38,
    recommendedPresetId: 'dossier-noir',
  },
];

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
