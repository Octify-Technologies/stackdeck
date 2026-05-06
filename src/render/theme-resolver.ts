import type { ColorTokens, Density, Mode, Palette, Style, ThemeRef } from '@/ir/schema';

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

export function resolveTheme(ref: ThemeRef, style: Style, palette: Palette): ResolvedTheme {
  const colors = mergeColors(style.colors[ref.mode], palette);
  const cssVars = buildCssVars(colors, style, ref.density, ref.mode);
  return { ref, colors, cssVars };
}

function mergeColors(base: ColorTokens, palette: Palette): ColorTokens {
  return {
    brand: palette.brand,
    accent: palette.accent,
    surface: palette.surface ?? base.surface,
    surfaceMuted: palette.surfaceMuted ?? base.surfaceMuted,
    text: palette.text ?? base.text,
    textMuted: palette.textMuted ?? base.textMuted,
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
  const m = DENSITY_MULTIPLIER[density];
  const base = style.spacingBase;
  const scale = (n: number) => `${n * base * m}px`;
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

    '--space-xs': scale(0.25),
    '--space-sm': scale(0.5),
    '--space-md': scale(1),
    '--space-lg': scale(1.5),
    '--space-xl': scale(2.5),
    '--space-2xl': scale(4),
    '--slide-padding': scale(4),
    '--measure-max': '64ch',

    '--radius-sm': radius(style.radius.sm),
    '--radius-md': radius(style.radius.md),
    '--radius-lg': radius(style.radius.lg),

    '--shadow-sm': shadow.sm ?? 'none',
    '--shadow-md': shadow.md ?? 'none',
    '--shadow-lg': shadow.lg ?? 'none',
  };
}
