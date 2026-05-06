'use client';

import { useMemo, type CSSProperties, type ReactNode } from 'react';

import type { Brand, Palette, ThemeRef } from '@/ir/schema';
import type { Preset } from '@/app/presets/presets';

import { resolveTheme } from './theme-resolver';

type Props = {
  theme: ThemeRef;
  preset: Preset;
  palette: Palette;
  brand?: Brand;
  children: ReactNode;
  className?: string;
};

/**
 * Wraps a deck and emits CSS custom properties on a `.deck-root` element,
 * derived from the active Preset + Palette + Density + Mode (and optional
 * Brand overrides). Block components read these variables; switching theme
 * is a CSS variable swap with no React reconciliation. Also publishes the
 * active preset id as `data-preset` so per-preset CSS files can scope their
 * rules.
 */
export function ThemeProvider({ theme, preset, palette, brand, children, className }: Props) {
  const resolved = useMemo(
    () => resolveTheme(theme, preset, palette, brand),
    [theme, preset, palette, brand],
  );

  const styleObject = resolved.cssVars as unknown as CSSProperties;

  return (
    <div
      className={['deck-root', className].filter(Boolean).join(' ')}
      style={styleObject}
      data-mode={theme.mode}
      data-density={theme.density}
      data-preset={theme.presetId}
      data-palette={theme.paletteId}
    >
      {children}
    </div>
  );
}
