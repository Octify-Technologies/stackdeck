export type TemplateCategory = 'case-study' | 'pitch' | 'sales' | 'internal';

/**
 * A Template is content data: the markdown directives for a starter deck.
 * Empty registry. Each preset will ship its own curated demo template here.
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

export const TEMPLATES: Template[] = [];

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
