import type { Palette } from '@/ir/schema';

import { DOSSIER_PALETTE } from './palettes/dossier';

/**
 * Palette registry. Each preset ships its own palette and registers it
 * here. Lookups return undefined when the id is unknown; the renderer
 * falls back to a neutral built-in token set.
 */
const palettes: Record<string, Palette> = {
  [DOSSIER_PALETTE.id]: DOSSIER_PALETTE,
};

export const allPalettes = Object.values(palettes);

export function getPalette(id: string): Palette | undefined {
  return palettes[id];
}
