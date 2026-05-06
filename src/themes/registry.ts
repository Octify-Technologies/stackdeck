import type { Palette } from '@/ir/schema';

import { midnight } from './palettes/midnight';
import { obsidian } from './palettes/obsidian';

const palettes: Record<string, Palette> = {
  [obsidian.id]: obsidian,
  [midnight.id]: midnight,
};

export const allPalettes = Object.values(palettes);

/**
 * Tolerant lookup: returns the requested palette, or the first palette in the
 * registry if the id is unknown. Lets old decks (which may reference a removed
 * palette id) keep rendering instead of throwing.
 */
export function getPalette(id: string): Palette {
  return palettes[id] ?? allPalettes[0];
}
