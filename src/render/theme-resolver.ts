import type { Brand, ColorTokens, Density, Mode, Palette, ThemeRef } from '@/ir/schema';
import type { Preset } from '@/app/presets/presets';
import { getFont } from '@/themes/fonts';

import { ensureContrast } from './contrast';

const DENSITY_MULTIPLIER: Record<Density, number> = {
  dense: 0.75,
  comfortable: 1.0,
  airy: 1.35,
  spacious: 1.7,
};

/**
 * Sensible defaults for radius / shadow / motion / spacing that every preset
 * inherits. A preset that wants different values overrides them in its scoped
 * CSS file (`[data-preset='<id>']`).
 */
const DEFAULT_SPACING_BASE = 8;

const DEFAULT_RADIUS = { sm: '4px', md: '8px', lg: '16px' };

const DEFAULT_SHADOW = {
  light: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
    md: '0 8px 24px -4px rgba(0, 0, 0, 0.08)',
    lg: '0 24px 48px -12px rgba(0, 0, 0, 0.16)',
  },
  dark: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
    md: '0 8px 24px -4px rgba(0, 0, 0, 0.6)',
    lg: '0 24px 48px -12px rgba(0, 0, 0, 0.8)',
  },
};

type ResolvedTheme = {
  ref: ThemeRef;
  colors: ColorTokens;
  cssVars: Record<string, string>;
};

/**
 * Compose a Preset + Palette + Density + Mode (+ optional Brand overrides) into
 * a flat token map ready to apply as CSS custom properties.
 */
export function resolveTheme(
  ref: ThemeRef,
  preset: Preset,
  palette: Palette,
  brand?: Brand,
): ResolvedTheme {
  const colors = mergeColors(palette[ref.mode], brand);
  const fonts = mergeFonts(preset, ref.fonts);
  const cssVars = buildCssVars(colors, fonts, ref.density, ref.mode);
  return { ref, colors, cssVars };
}

type ResolvedFonts = { display: string; body: string; mono: string };

function mergeFonts(preset: Preset, overrides?: ThemeRef['fonts']): ResolvedFonts {
  return {
    display: getFont(overrides?.display)?.family ?? preset.fonts.display,
    body: getFont(overrides?.body)?.family ?? preset.fonts.body,
    mono: getFont(overrides?.mono)?.family ?? preset.fonts.mono,
  };
}

function mergeColors(base: ColorTokens, brand?: Brand): ColorTokens {
  const surface = base.surface;
  return {
    brand: brand?.brandColor ?? base.brand,
    accent: brand?.accentColor ?? base.accent,
    surface,
    surfaceMuted: base.surfaceMuted,
    text: ensureContrast(base.text, surface, 'strong'),
    textMuted: ensureContrast(base.textMuted, surface, 'muted', 3.0),
    border: base.border,
    success: base.success,
    warn: base.warn,
    danger: base.danger,
  };
}

function buildCssVars(
  c: ColorTokens,
  fonts: ResolvedFonts,
  density: Density,
  mode: Mode,
): Record<string, string> {
  const multiplier = DENSITY_MULTIPLIER[density];
  const scale = (n: number) => `${n * DEFAULT_SPACING_BASE * multiplier}px`;

  const shadow = DEFAULT_SHADOW[mode];

  return {
    '--color-brand': c.brand,
    '--color-accent': c.accent,
    '--color-surface': c.surface,
    '--color-surface-muted': c.surfaceMuted,
    '--color-text': c.text,
    '--color-text-muted': c.textMuted,
    '--color-border': c.border,
    '--color-success': c.success,
    '--color-warn': c.warn,
    '--color-danger': c.danger,

    '--font-display': fonts.display,
    '--font-body': fonts.body,
    '--font-mono': fonts.mono,

    '--space-xs': scale(0.25),
    '--space-sm': scale(0.5),
    '--space-md': scale(1),
    '--space-lg': scale(1.5),
    '--space-xl': scale(2.5),
    '--space-2xl': scale(4),
    '--space-3xl': scale(6),
    '--slide-padding': scale(4.5),
    '--measure-max': '60ch',

    '--radius-sm': DEFAULT_RADIUS.sm,
    '--radius-md': DEFAULT_RADIUS.md,
    '--radius-lg': DEFAULT_RADIUS.lg,

    '--shadow-sm': shadow.sm,
    '--shadow-md': shadow.md,
    '--shadow-lg': shadow.lg,
  };
}
