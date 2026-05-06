import { describe, expect, it } from 'vitest';

import { resolveTheme } from '@/render/theme-resolver';
import type { Palette, ThemeRef } from '@/ir/schema';
import { modern } from '@/themes/styles/modern';
import { electric } from '@/themes/palettes/electric';

const baseTheme: ThemeRef = {
  styleId: 'modern',
  paletteId: 'electric',
  density: 'comfortable',
  mode: 'light',
};

describe('resolveTheme', () => {
  it('emits CSS variables for every required color token', () => {
    const r = resolveTheme(baseTheme, modern, electric);
    const required = [
      '--color-brand',
      '--color-accent',
      '--color-surface',
      '--color-surface-muted',
      '--color-text',
      '--color-text-muted',
      '--color-border',
      '--color-success',
      '--color-warn',
      '--color-danger',
    ];
    for (const v of required) {
      expect(r.cssVars[v]).toBeDefined();
    }
  });

  it('overrides brand and accent from the palette', () => {
    const r = resolveTheme(baseTheme, modern, electric);
    expect(r.cssVars['--color-brand']).toBe(electric.brand);
    expect(r.cssVars['--color-accent']).toBe(electric.accent);
  });

  it('selects dark color tokens when mode is dark', () => {
    const r = resolveTheme({ ...baseTheme, mode: 'dark' }, modern, electric);
    expect(r.cssVars['--color-surface']).toBe(modern.colors.dark.surface);
    expect(r.cssVars['--color-text']).toBe(modern.colors.dark.text);
  });

  it('scales spacing variables by density multiplier', () => {
    const dense = resolveTheme({ ...baseTheme, density: 'dense' }, modern, electric);
    const airy = resolveTheme({ ...baseTheme, density: 'airy' }, modern, electric);

    const denseMd = parseFloat(dense.cssVars['--space-md']);
    const airyMd = parseFloat(airy.cssVars['--space-md']);

    expect(airyMd).toBeGreaterThan(denseMd);
  });

  it('honors palette-level surface override when provided', () => {
    const customPalette: Palette = {
      ...electric,
      surface: '#fefefe',
    };
    const r = resolveTheme(baseTheme, modern, customPalette);
    expect(r.cssVars['--color-surface']).toBe('#fefefe');
  });

  it('picks shadow tokens for the active mode', () => {
    const light = resolveTheme(baseTheme, modern, electric);
    const dark = resolveTheme({ ...baseTheme, mode: 'dark' }, modern, electric);
    expect(light.cssVars['--shadow-md']).toBe(modern.shadow.light.md);
    expect(dark.cssVars['--shadow-md']).toBe(modern.shadow.dark.md);
  });
});
