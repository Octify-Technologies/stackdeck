import type { Palette, Style } from '@/ir/schema';

import { brutalist } from './styles/brutalist';
import { editorial } from './styles/editorial';
import { modern } from './styles/modern';
import { soft } from './styles/soft';
import { electric } from './palettes/electric';
import { forest } from './palettes/forest';
import { mono } from './palettes/mono';
import { sunset } from './palettes/sunset';

const styles: Record<string, Style> = {
  [modern.id]: modern,
  [editorial.id]: editorial,
  [brutalist.id]: brutalist,
  [soft.id]: soft,
};

const palettes: Record<string, Palette> = {
  [electric.id]: electric,
  [sunset.id]: sunset,
  [forest.id]: forest,
  [mono.id]: mono,
};

export function getStyle(id: string): Style {
  const style = styles[id];
  if (!style) throw new Error(`Unknown styleId: ${id}`);
  return style;
}

export function getPalette(id: string): Palette {
  const palette = palettes[id];
  if (!palette) throw new Error(`Unknown paletteId: ${id}`);
  return palette;
}

export const allStyles = Object.values(styles);
export const allPalettes = Object.values(palettes);
