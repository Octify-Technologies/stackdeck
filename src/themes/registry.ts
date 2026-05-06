import type { Palette } from '@/ir/schema';

/**
 * Palette registry. Empty. Each preset ships its own palette and registers
 * it here. Lookups return undefined when nothing is registered; the renderer
 * falls back to a neutral built-in token set.
 */
const palettes: Record<string, Palette> = {};

export const allPalettes = Object.values(palettes);

export function getPalette(id: string): Palette | undefined {
  return palettes[id];
}
