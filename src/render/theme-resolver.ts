import type { Brand, ColorTokens, Density, Mode, Palette, Style, ThemeRef } from '@/ir/schema';

import { ensureContrast } from './contrast';

const DENSITY_MULTIPLIER: Record<Density, number> = {
  dense: 0.75,
  comfortable: 1.0,
  airy: 1.35,
  spacious: 1.7,
};

type ResolvedTheme = {
  ref: ThemeRef;
  colors: ColorTokens;
  cssVars: Record<string, string>;
};

/**
 * Compose a Style + Palette + Density + Mode (+ optional Brand overrides) into
 * a flat token map ready to apply as CSS custom properties.
 */
export function resolveTheme(
  ref: ThemeRef,
  style: Style,
  palette: Palette,
  brand?: Brand,
): ResolvedTheme {
  const colors = mergeColors(style.colors[ref.mode], palette, brand);
  const cssVars = buildCssVars(colors, style, ref.density, ref.mode);
  return { ref, colors, cssVars };
}

function mergeColors(base: ColorTokens, palette: Palette, brand?: Brand): ColorTokens {
  const surface = palette.surface ?? base.surface;
  const requestedText = palette.text ?? base.text;
  const requestedTextMuted = palette.textMuted ?? base.textMuted;
  return {
    brand: brand?.brandColor ?? palette.brand,
    accent: brand?.accentColor ?? palette.accent,
    surface,
    surfaceMuted: palette.surfaceMuted ?? base.surfaceMuted,
    text: ensureContrast(requestedText, surface, 'strong'),
    textMuted: ensureContrast(requestedTextMuted, surface, 'muted', 3.0),
    border: palette.border ?? base.border,
    success: base.success,
    warn: base.warn,
    danger: base.danger,
  };
}

function buildCssVars(
  c: ColorTokens,
  style: Style,
  density: Density,
  mode: Mode,
): Record<string, string> {
  const multiplier = DENSITY_MULTIPLIER[density];
  const base = style.spacingBase;
  const scale = (n: number) => `${n * base * multiplier}px`;
  const radius = (n: number) => `${n}px`;

  const shadow = style.shadow[mode];

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

    '--font-display': style.typography.display.family,
    '--font-body': style.typography.body.family,
    '--font-mono': style.typography.mono?.family ?? 'ui-monospace, monospace',

    '--weight-display': String(style.typography.display.weight),
    '--weight-body': String(style.typography.body.weight),

    '--leading-display': String(style.typography.display.leading ?? 1.1),
    '--leading-body': String(style.typography.body.leading ?? 1.5),

    '--tracking-display': `${style.typography.display.tracking ?? 0}em`,

    '--space-xs': scale(0.25),
    '--space-sm': scale(0.5),
    '--space-md': scale(1),
    '--space-lg': scale(1.5),
    '--space-xl': scale(2.5),
    '--space-2xl': scale(4),
    '--space-3xl': scale(6),
    '--slide-padding': scale(4.5),
    '--measure-max': '60ch',

    '--radius-sm': radius(style.radius.sm),
    '--radius-md': radius(style.radius.md),
    '--radius-lg': radius(style.radius.lg),

    '--shadow-sm': shadow.sm ?? 'none',
    '--shadow-md': shadow.md ?? 'none',
    '--shadow-lg': shadow.lg ?? 'none',
  };
}
