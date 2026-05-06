import { describe, expect, it } from 'vitest';

import { lintColors } from '@/render/lint';

const baseColors = {
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
};

describe('lintColors', () => {
  it('returns no warnings for a balanced default palette', () => {
    expect(lintColors(baseColors)).toEqual([]);
  });

  it('flags poor brand-on-surface contrast', () => {
    const bad = { ...baseColors, brand: '#fafafa' };
    const warnings = lintColors(bad);
    expect(warnings.some((w) => w.id === 'brand-surface')).toBe(true);
  });

  it('flags poor muted-text contrast', () => {
    const bad = { ...baseColors, textMuted: '#e5e5e5' };
    const warnings = lintColors(bad);
    expect(warnings.some((w) => w.id === 'text-muted-surface')).toBe(true);
  });
});
