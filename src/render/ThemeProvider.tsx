'use client';

import { useMemo, type CSSProperties, type ReactNode } from 'react';

import { StyleIdProvider } from '@/blocks';
import type { Brand, Palette, Style, ThemeRef } from '@/ir/schema';

import { resolveTheme } from './theme-resolver';

type Props = {
  theme: ThemeRef;
  style: Style;
  palette: Palette;
  brand?: Brand;
  children: ReactNode;
  className?: string;
};

/**
 * Wraps a deck and emits ~40 CSS custom properties on a `.deck-root` element,
 * derived from the active Style + Palette + Density + Mode (and optional
 * Brand overrides). Block components read these variables; switching theme
 * is a CSS variable swap with no React reconciliation. Also publishes the
 * active styleId via context so the block registry can resolve per-Style
 * overrides.
 */
export function ThemeProvider({ theme, style, palette, brand, children, className }: Props) {
  const resolved = useMemo(
    () => resolveTheme(theme, style, palette, brand),
    [theme, style, palette, brand],
  );

  const styleObject = resolved.cssVars as unknown as CSSProperties;

  return (
    <StyleIdProvider styleId={theme.styleId}>
      <div
        className={['deck-root', className].filter(Boolean).join(' ')}
        style={styleObject}
        data-mode={theme.mode}
        data-density={theme.density}
        data-style={theme.styleId}
        data-palette={theme.paletteId}
      >
        {children}
      </div>
    </StyleIdProvider>
  );
}
