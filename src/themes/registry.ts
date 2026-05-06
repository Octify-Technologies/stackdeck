import type { Palette } from '@/ir/schema';

import { electric } from './palettes/electric';
import { forest } from './palettes/forest';
import { mono } from './palettes/mono';
import { obsidian } from './palettes/obsidian';
import { sunset } from './palettes/sunset';

const palettes: Record<string, Palette> = {
  [obsidian.id]: obsidian,
  [electric.id]: electric,
  [sunset.id]: sunset,
  [forest.id]: forest,
  [mono.id]: mono,
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
