import type { Palette } from '@/ir/schema';

/**
 * Midnight: cool steel-blue surface with a soft sky-cyan accent. A more
 * technical mood than Obsidian, suited to product and engineering decks.
 */
export const midnight: Palette = {
  id: 'midnight',
  name: 'Midnight',
  tokens: {
    brand: '#e7ecf3',
    accent: '#7dd3fc',
    surface: '#0a0f1a',
    surfaceMuted: '#11182a',
    text: '#e7ecf3',
    textMuted: '#7e8aa1',
    border: '#1f2940',
    success: '#86efac',
    warn: '#fbbf24',
    danger: '#fb7185',
  },
};
