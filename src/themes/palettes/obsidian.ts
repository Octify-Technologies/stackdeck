import type { Palette } from '@/ir/schema';

/**
 * Obsidian: ink-and-champagne. The default Dossier palette.
 */
export const obsidian: Palette = {
  id: 'obsidian',
  name: 'Obsidian',
  light: {
    brand: '#0b0d12',
    accent: '#a07842',
    surface: '#f4ede1',
    surfaceMuted: '#ebe2d2',
    text: '#0b0d12',
    textMuted: '#5a5448',
    border: '#d8cdb8',
    success: '#3f6b46',
    warn: '#9a6b1f',
    danger: '#a23a2a',
  },
  dark: {
    brand: '#f4ede1',
    accent: '#c9a878',
    surface: '#0b0d12',
    surfaceMuted: '#13161e',
    text: '#f4ede1',
    textMuted: '#8a8676',
    border: '#23262f',
    success: '#7fb287',
    warn: '#d4a85f',
    danger: '#d97a6a',
  },
};
