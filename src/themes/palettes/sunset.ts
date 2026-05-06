import type { Palette } from '@/ir/schema';

export const sunset: Palette = {
  id: 'sunset',
  name: 'Sunset',
  light: {
    brand: '#ea580c',
    accent: '#db2777',
    surface: '#fffbeb',
    surfaceMuted: '#fef3c7',
    text: '#1c1917',
    textMuted: '#78716c',
    border: '#fde68a',
    success: '#15803d',
    warn: '#b45309',
    danger: '#b91c1c',
  },
  dark: {
    brand: '#fb923c',
    accent: '#f472b6',
    surface: '#1c1917',
    surfaceMuted: '#292524',
    text: '#fef3c7',
    textMuted: '#a8a29e',
    border: '#44403c',
    success: '#22c55e',
    warn: '#f59e0b',
    danger: '#ef4444',
  },
};
