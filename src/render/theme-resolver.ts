import type { Brand, ColorTokens, Palette, ThemeRef } from '@/ir/schema';
import type { Preset } from '@/app/presets/presets';
import { getFont } from '@/themes/fonts';

import { ensureContrast } from './contrast';

/**
 * The deck design owns spacing, radius, shadows, and the mono font as
 * fixed system constants. Only color tokens and the display+body font
 * vary per deck (palette + fontId). Density was removed: one airy scale
 * for everyone keeps the editorial signature consistent.
 */
const SPACING_BASE = 8;
const SPACING_MULTIPLIER = 1.35;

const DEFAULT_RADIUS = { sm: '4px', md: '8px', lg: '16px' };

const DEFAULT_SHADOW = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
  md: '0 8px 24px -4px rgba(0, 0, 0, 0.6)',
  lg: '0 24px 48px -12px rgba(0, 0, 0, 0.8)',
};

const MONO_FAMILY = 'var(--font-jetbrains), JetBrains Mono, ui-monospace, monospace';

type ResolvedTheme = {
  ref: ThemeRef;
  colors: ColorTokens;
  cssVars: Record<string, string>;
};

/**
 * Compose a Preset + Palette (+ optional Brand overrides) into a flat
 * token map ready to apply as CSS custom properties.
 */
export function resolveTheme(
  ref: ThemeRef,
  preset: Preset,
  palette: Palette,
  brand?: Brand,
): ResolvedTheme {
  const colors = mergeColors(palette.tokens, brand);
  const fontFamily = resolveFontFamily(preset, ref);
  const cssVars = buildCssVars(colors, fontFamily);
  return { ref, colors, cssVars };
}

function resolveFontFamily(preset: Preset, ref: ThemeRef): string {
  const overrideId = ref.fontId;
  const override = overrideId ? getFont(overrideId) : undefined;
  const fallback = getFont(preset.fontId) ?? getFont('geist');
  return (override ?? fallback)?.family ?? 'system-ui, sans-serif';
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

function buildCssVars(c: ColorTokens, fontFamily: string): Record<string, string> {
  const scale = (n: number) => `${n * SPACING_BASE * SPACING_MULTIPLIER}px`;

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

    '--font-display': fontFamily,
    '--font-body': fontFamily,
    '--font-mono': MONO_FAMILY,

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

    '--shadow-sm': DEFAULT_SHADOW.sm,
    '--shadow-md': DEFAULT_SHADOW.md,
    '--shadow-lg': DEFAULT_SHADOW.lg,
  };
}
