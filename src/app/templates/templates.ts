import { DOSSIER_CASE_STUDY_SEED } from './seeds/dossier-case-study';

export type TemplateCategory = 'case-study' | 'pitch' | 'sales' | 'internal';

/**
 * A Template is content data: the markdown directives for a starter deck.
 * Each preset ships its own curated demo template here.
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
    id: 'dossier-case-study',
    name: 'Halden Industries · Dossier',
    vibe: 'Fourteen-slide editorial dossier: cover, tear sheet, three chapter dividers, hero stat, KPI grid, pull quote, before/after, chart, closer.',
    category: 'case-study',
    seed: DOSSIER_CASE_STUDY_SEED,
    slideCount: 14,
    recommendedPresetId: 'dossier',
  },
];

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
