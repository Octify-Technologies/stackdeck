import type { Style } from '@/ir/schema';

/**
 * Brutalist: heavy mono-ish display, sharp edges, no shadows, maximum contrast.
 * Anti-corporate. Looks at home in design studios, indie launches, manifestos.
 */
export const brutalist: Style = {
  id: 'brutalist',
  name: 'Brutalist',
  description: 'Sharp, loud, opinionated. Heavy display type with zero radii and inverted slabs.',
  typography: {
    display: {
      family: 'var(--font-space-grotesk), Space Grotesk, ui-sans-serif, sans-serif',
      weight: 700,
      scaleStep: 8,
      tracking: -0.04,
      leading: 0.98,
    },
    body: {
      family: 'var(--font-space-grotesk), Space Grotesk, ui-sans-serif, sans-serif',
      weight: 500,
      scaleStep: 0,
      leading: 1.45,
    },
    mono: {
      family: 'var(--font-jetbrains), JetBrains Mono, ui-monospace, monospace',
      weight: 600,
      scaleStep: -1,
    },
  },
  colors: {
    light: {
      brand: '#0a0a0a',
      accent: '#facc15',
      surface: '#fafafa',
      surfaceMuted: '#0a0a0a',
      text: '#0a0a0a',
      textMuted: '#404040',
      border: '#0a0a0a',
      success: '#16a34a',
      warn: '#eab308',
      danger: '#dc2626',
    },
    dark: {
      brand: '#fafafa',
      accent: '#facc15',
      surface: '#0a0a0a',
      surfaceMuted: '#fafafa',
      text: '#fafafa',
      textMuted: '#a3a3a3',
      border: '#fafafa',
      success: '#22c55e',
      warn: '#facc15',
      danger: '#ef4444',
    },
  },
  radius: { sm: 0, md: 0, lg: 0 },
  shadow: {
    light: {
      sm: '4px 4px 0 0 #0a0a0a',
      md: '8px 8px 0 0 #0a0a0a',
      lg: '16px 16px 0 0 #0a0a0a',
    },
    dark: {
      sm: '4px 4px 0 0 #fafafa',
      md: '8px 8px 0 0 #fafafa',
      lg: '16px 16px 0 0 #fafafa',
    },
  },
  motion: {
    duration: { fast: 100, base: 150, slow: 200 },
    easing: { standard: 'cubic-bezier(0.5, 0, 0.5, 1)', emphasized: 'steps(3)' },
  },
  spacingBase: 8,
  printSafe: true,
};
