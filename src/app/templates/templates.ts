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

export const TEMPLATES: Template[] = [];

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
