/**
 * The deck design itself is locked: one editorial system, defined entirely
 * in `src/styles/dossier.css` and read from CSS variables. A Preset is just
 * a named starting combination of palette + font over that locked design.
 * Adding a preset means picking a palette/font pair and writing a name. It
 * never means writing CSS.
 */
export type Preset = {
  id: string;
  name: string;
  vibe: string;
  paletteId: string;
  /** Id of an entry in `src/themes/fonts.ts`. */
  fontId: string;
  /** Template the gallery uses for the card preview. */
  previewTemplateId: string;
};

export const PRESETS: Preset[] = [
  {
    id: 'dossier-noir',
    name: 'Dossier · Noir',
    vibe: 'Ink-and-champagne editorial. A premium dark-luxe look for client case studies.',
    paletteId: 'obsidian',
    fontId: 'geist',
    previewTemplateId: 'dossier-kitchen-sink',
  },
  {
    id: 'dossier-midnight',
    name: 'Dossier · Midnight',
    vibe: 'Steel-blue surface with sky-cyan accents. Same editorial system, technical mood.',
    paletteId: 'midnight',
    fontId: 'inter',
    previewTemplateId: 'dossier-kitchen-sink',
  },
];

export const DEFAULT_PRESET_ID = PRESETS[0].id;

/**
 * Tolerant lookup: returns the requested preset, or the first preset in the
 * registry if the id is unknown. Lets old decks (which may reference a removed
 * preset id) keep rendering instead of throwing.
 */
export function getPreset(id: string): Preset {
  return PRESETS.find((p) => p.id === id) ?? PRESETS[0];
}
