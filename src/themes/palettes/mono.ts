import type { Palette } from '@/ir/schema';

export const mono: Palette = {
  id: 'mono',
  name: 'Monochrome',
  light: {
    brand: '#171717',
    accent: '#525252',
    surface: '#fafafa',
    surfaceMuted: '#f4f4f5',
    text: '#0a0a0a',
    textMuted: '#52525b',
    border: '#d4d4d8',
    success: '#15803d',
    warn: '#a16207',
    danger: '#991b1b',
  },
  dark: {
    brand: '#fafafa',
    accent: '#a3a3a3',
    surface: '#0a0a0a',
    surfaceMuted: '#171717',
    text: '#fafafa',
    textMuted: '#a1a1aa',
    border: '#27272a',
    success: '#22c55e',
    warn: '#f59e0b',
    danger: '#ef4444',
  },
};
