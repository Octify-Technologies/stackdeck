import { describe, expect, it } from 'vitest';

import {
  checkContrast,
  contrastRatio,
  deriveAccent,
  hexToRgb,
  isValidHex,
  oklchToHex,
  pickReadableText,
  rgbToHex,
} from '@/lib/color';

describe('isValidHex', () => {
  it('accepts 3-digit hex', () => {
    expect(isValidHex('#abc')).toBe(true);
    expect(isValidHex('abc')).toBe(true);
  });

  it('accepts 6-digit hex', () => {
    expect(isValidHex('#abcdef')).toBe(true);
    expect(isValidHex('ABCDEF')).toBe(true);
  });

  it('rejects malformed', () => {
    expect(isValidHex('not-a-color')).toBe(false);
    expect(isValidHex('#abcd')).toBe(false);
    expect(isValidHex('#zzzzzz')).toBe(false);
  });
});

describe('hexToRgb / rgbToHex', () => {
  it('round-trips white', () => {
    expect(rgbToHex(hexToRgb('#ffffff'))).toBe('#ffffff');
  });

  it('round-trips black', () => {
    expect(rgbToHex(hexToRgb('#000000'))).toBe('#000000');
  });

  it('round-trips a color', () => {
    expect(rgbToHex(hexToRgb('#2563eb'))).toBe('#2563eb');
  });

  it('expands 3-digit hex correctly', () => {
    expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb('#000')).toEqual({ r: 0, g: 0, b: 0 });
  });
});

describe('contrastRatio', () => {
  it('returns 21 for black on white', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0);
  });

  it('returns 1 for the same color', () => {
    expect(contrastRatio('#2563eb', '#2563eb')).toBeCloseTo(1, 2);
  });

  it('is symmetric', () => {
    expect(contrastRatio('#0a0a0a', '#ffffff')).toBeCloseTo(contrastRatio('#ffffff', '#0a0a0a'), 4);
  });
});

describe('checkContrast', () => {
  it('passes AA for high contrast text', () => {
    const v = checkContrast('#0a0a0a', '#ffffff');
    expect(v.passesAA).toBe(true);
    expect(v.passesAAA).toBe(true);
  });

  it('fails AA for low contrast', () => {
    const v = checkContrast('#cccccc', '#ffffff');
    expect(v.passesAA).toBe(false);
  });
});

describe('pickReadableText', () => {
  it('picks black on light backgrounds', () => {
    expect(pickReadableText('#fafafa')).toBe('#0a0a0a');
    expect(pickReadableText('#ffffff')).toBe('#0a0a0a');
  });

  it('picks white on dark backgrounds', () => {
    expect(pickReadableText('#0a0a0a')).toBe('#ffffff');
    expect(pickReadableText('#1c1917')).toBe('#ffffff');
  });
});

describe('deriveAccent', () => {
  it('returns a valid hex color', () => {
    const accent = deriveAccent('#2563eb');
    expect(isValidHex(accent)).toBe(true);
  });

  it('produces a different color than the input', () => {
    expect(deriveAccent('#2563eb')).not.toBe('#2563eb');
  });

  it('handles black gracefully', () => {
    expect(isValidHex(deriveAccent('#000000'))).toBe(true);
  });
});

describe('oklchToHex', () => {
  it('clamps to valid hex output', () => {
    const out = oklchToHex({ l: 0.5, c: 0.1, h: 180 });
    expect(isValidHex(out)).toBe(true);
  });
});
