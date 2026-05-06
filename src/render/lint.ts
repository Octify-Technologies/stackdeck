import type { ColorTokens } from '@/ir/schema';

import { contrastRatio } from './contrast';

export type ContrastWarning = {
  /** Stable identifier so the UI can dedupe. */
  id: string;
  /** Short human-readable label, e.g. "Brand on surface". */
  label: string;
  ratio: number;
  needs: number;
  severity: 'fail' | 'low';
};

/**
 * Lint a resolved color set for poor contrast on visible UI pairs. Auto-contrast
 * already protects body text, so this focuses on brand/accent against surface
 * (used for stats values, CTAs, kickers) where a low ratio still renders but
 * looks washed out.
 */
export function lintColors(colors: ColorTokens): ContrastWarning[] {
  const checks: Array<{ id: string; label: string; fg: string; bg: string; needs: number }> = [
    {
      id: 'brand-surface',
      label: 'Brand on surface',
      fg: colors.brand,
      bg: colors.surface,
      needs: 3.0,
    },
    {
      id: 'accent-surface',
      label: 'Accent on surface',
      fg: colors.accent,
      bg: colors.surface,
      needs: 3.0,
    },
    {
      id: 'brand-surface-muted',
      label: 'Brand on surface-muted',
      fg: colors.brand,
      bg: colors.surfaceMuted,
      needs: 3.0,
    },
    {
      id: 'text-muted-surface',
      label: 'Muted text on surface',
      fg: colors.textMuted,
      bg: colors.surface,
      needs: 3.0,
    },
  ];

  const warnings: ContrastWarning[] = [];
  for (const c of checks) {
    const ratio = contrastRatio(c.fg, c.bg);
    if (ratio < c.needs) {
      warnings.push({
        id: c.id,
        label: c.label,
        ratio: Math.round(ratio * 10) / 10,
        needs: c.needs,
        severity: ratio < c.needs * 0.7 ? 'fail' : 'low',
      });
    }
  }
  return warnings;
}
