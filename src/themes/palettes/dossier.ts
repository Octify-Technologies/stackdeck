import type { Palette } from '@/ir/schema';

/**
 * Dossier palette. Warm near-black ink ground with a single brass accent
 * and oxblood reserved for hot moments (negative deltas, single critical
 * highlight per slide). Most slides read entirely in cream + textMuted +
 * hairlines; brass and oxblood are rationed.
 */
export const DOSSIER_PALETTE: Palette = {
  id: 'dossier',
  name: 'Dossier Noir',
  tokens: {
    surface: '#0E0D0B',
    surfaceMuted: '#15130F',
    text: '#F2EDE2',
    textMuted: '#9A9384',
    border: '#2A2723',
    brand: '#D4AC55',
    accent: '#C8492C',
    success: '#7FA86B',
    warn: '#D4A24A',
    danger: '#C8492C',
  },
};
