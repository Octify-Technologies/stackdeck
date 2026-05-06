import { describe, expect, it } from 'vitest';

import { contrastRatio, ensureContrast, relativeLuminance } from '@/render/contrast';

describe('contrast', () => {
  it('white on black has the maximum contrast ratio', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 0);
  });

  it('relative luminance is 0 for black and 1 for white', () => {
    expect(relativeLuminance('#000000')).toBe(0);
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 5);
  });

  it('keeps text when contrast already meets the threshold', () => {
    const out = ensureContrast('#0a0a0a', '#ffffff', 'strong');
    expect(out).toBe('#0a0a0a');
  });

  it('flips text to white when surface is dark and original text fails', () => {
    const out = ensureContrast('#3a3a3a', '#0a0a0a', 'strong');
    expect(out).toBe('#fafafa');
  });

  it('flips text to black when surface is light and original text fails', () => {
    const out = ensureContrast('#cccccc', '#fafafa', 'strong');
    expect(out).toBe('#0a0a0a');
  });

  it('uses softer fallbacks for muted text', () => {
    const out = ensureContrast('#cccccc', '#fafafa', 'muted', 3.0);
    expect(out).toBe('#525252');
  });
});
