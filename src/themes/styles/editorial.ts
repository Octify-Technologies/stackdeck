import type { Style } from '@/ir/schema';

/**
 * Editorial: serif display + sans body, generous whitespace, magazine vibes.
 * Great for keynotes, narrative decks, year-in-review presentations.
 */
export const editorial: Style = {
  id: 'editorial',
  name: 'Editorial',
  description:
    'Magazine-grade typography with serif display, generous whitespace, and confident hierarchy.',
  typography: {
    display: {
      family: 'var(--font-fraunces), Fraunces, Georgia, serif',
      weight: 600,
      scaleStep: 7,
      tracking: -0.025,
      leading: 1.02,
    },
    body: {
      family: 'var(--font-inter), Inter, system-ui, sans-serif',
      weight: 400,
      scaleStep: 0,
      leading: 1.6,
    },
    mono: {
      family: 'var(--font-jetbrains), JetBrains Mono, ui-monospace, monospace',
      weight: 400,
      scaleStep: -1,
    },
  },
  colors: {
    light: {
      brand: '#1c1917',
      accent: '#a16207',
      surface: '#fdfcf8',
      surfaceMuted: '#f5f3ed',
      text: '#1c1917',
      textMuted: '#57534e',
      border: '#e7e5dc',
      success: '#15803d',
      warn: '#b45309',
      danger: '#b91c1c',
    },
    dark: {
      brand: '#fafaf9',
      accent: '#fbbf24',
      surface: '#0c0a09',
      surfaceMuted: '#1c1917',
      text: '#fafaf9',
      textMuted: '#a8a29e',
      border: '#292524',
      success: '#22c55e',
      warn: '#f59e0b',
      danger: '#ef4444',
    },
  },
  radius: { sm: 2, md: 4, lg: 8 },
  shadow: {
    light: {
      sm: '0 1px 2px 0 rgba(28, 25, 23, 0.04)',
      md: '0 8px 24px -4px rgba(28, 25, 23, 0.08)',
      lg: '0 24px 48px -12px rgba(28, 25, 23, 0.16)',
    },
    dark: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
      md: '0 8px 24px -4px rgba(0, 0, 0, 0.6)',
      lg: '0 24px 48px -12px rgba(0, 0, 0, 0.8)',
    },
  },
  motion: {
    duration: { fast: 200, base: 350, slow: 600 },
    easing: {
      standard: 'cubic-bezier(0.32, 0.72, 0, 1)',
      emphasized: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  spacingBase: 8,
  printSafe: true,
};
