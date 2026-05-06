import type { Style } from '@/ir/schema';

export const modern: Style = {
  id: 'modern',
  name: 'Modern',
  description:
    'Clean sans-serif with confident hierarchy. Works for product, sales, and editorial decks.',
  typography: {
    display: {
      family: 'var(--font-inter), Inter, system-ui, sans-serif',
      weight: 700,
      scaleStep: 6,
      tracking: -0.02,
      leading: 1.05,
    },
    body: {
      family: 'var(--font-inter), Inter, system-ui, sans-serif',
      weight: 400,
      scaleStep: 0,
      leading: 1.5,
    },
    mono: {
      family: 'var(--font-jetbrains), JetBrains Mono, ui-monospace, monospace',
      weight: 400,
      scaleStep: -1,
    },
  },
  colors: {
    light: {
      brand: '#2563eb',
      accent: '#7c3aed',
      surface: '#ffffff',
      surfaceMuted: '#fafafa',
      text: '#0a0a0a',
      textMuted: '#525252',
      border: '#e5e5e5',
      success: '#16a34a',
      warn: '#d97706',
      danger: '#dc2626',
    },
    dark: {
      brand: '#3b82f6',
      accent: '#a78bfa',
      surface: '#0a0a0a',
      surfaceMuted: '#171717',
      text: '#fafafa',
      textMuted: '#a3a3a3',
      border: '#262626',
      success: '#22c55e',
      warn: '#f59e0b',
      danger: '#ef4444',
    },
  },
  radius: { sm: 6, md: 12, lg: 20 },
  shadow: {
    light: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
      md: '0 4px 12px -2px rgba(0, 0, 0, 0.08)',
      lg: '0 16px 32px -8px rgba(0, 0, 0, 0.12)',
    },
    dark: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
      md: '0 4px 12px -2px rgba(0, 0, 0, 0.5)',
      lg: '0 16px 32px -8px rgba(0, 0, 0, 0.6)',
    },
  },
  motion: {
    duration: { fast: 150, base: 250, slow: 400 },
    easing: { standard: 'cubic-bezier(0.2, 0, 0, 1)', emphasized: 'cubic-bezier(0.3, 0, 0.1, 1)' },
  },
  spacingBase: 8,
  printSafe: true,
};
