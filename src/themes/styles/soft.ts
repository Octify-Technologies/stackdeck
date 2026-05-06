import type { Style } from '@/ir/schema';

/**
 * Soft: pastel surfaces, generous radii, friendly serif-meets-sans pairing.
 * Designed for product launches, portfolios, lifestyle brands.
 */
export const soft: Style = {
  id: 'soft',
  name: 'Soft',
  description:
    'Pastel surfaces, friendly radii, warm serif-and-sans pairing. Approachable without being cute.',
  typography: {
    display: {
      family: 'var(--font-fraunces), Fraunces, Georgia, serif',
      weight: 500,
      scaleStep: 7,
      tracking: -0.02,
      leading: 1.05,
    },
    body: {
      family: 'var(--font-geist), Geist, system-ui, sans-serif',
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
      brand: '#7c5cff',
      accent: '#ff7eb6',
      surface: '#fbf7f4',
      surfaceMuted: '#f3ede6',
      text: '#1a1625',
      textMuted: '#6b5b73',
      border: '#e6dad0',
      success: '#7fb069',
      warn: '#e8a87c',
      danger: '#d76c8b',
    },
    dark: {
      brand: '#a594ff',
      accent: '#ffa4cd',
      surface: '#1a1625',
      surfaceMuted: '#241f33',
      text: '#fbf7f4',
      textMuted: '#b8a8c2',
      border: '#332b46',
      success: '#9bc486',
      warn: '#f0bb95',
      danger: '#ec8aa6',
    },
  },
  radius: { sm: 12, md: 20, lg: 32 },
  shadow: {
    light: {
      sm: '0 2px 8px -2px rgba(124, 92, 255, 0.08)',
      md: '0 12px 32px -8px rgba(124, 92, 255, 0.16)',
      lg: '0 32px 64px -16px rgba(124, 92, 255, 0.24)',
    },
    dark: {
      sm: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
      md: '0 12px 32px -8px rgba(0, 0, 0, 0.4)',
      lg: '0 32px 64px -16px rgba(0, 0, 0, 0.6)',
    },
  },
  motion: {
    duration: { fast: 200, base: 320, slow: 480 },
    easing: {
      standard: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      emphasized: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    },
  },
  spacingBase: 8,
  printSafe: true,
};
