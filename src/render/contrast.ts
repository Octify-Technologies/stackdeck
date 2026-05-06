/**
 * WCAG-friendly contrast helpers used by the theme resolver to keep text
 * legible across arbitrary palette + brand combinations.
 */

const HARD_BLACK = '#0a0a0a';
const HARD_WHITE = '#fafafa';
const SOFT_BLACK = '#525252';
const SOFT_WHITE = '#a3a3a3';

const HEX_RE = /^#([0-9a-f]{3,8})$/i;

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function parseHex(input: string): { r: number; g: number; b: number } | null {
  const m = HEX_RE.exec(input.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3)
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  if (h.length !== 6 && h.length !== 8) return null;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return null;
  return { r, g, b };
}

function srgbToLinear(channel: number): number {
  const v = channel / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number {
  const parsed = parseHex(hex);
  if (!parsed) return 0;
  const r = srgbToLinear(parsed.r);
  const g = srgbToLinear(parsed.g);
  const b = srgbToLinear(parsed.b);
  return clamp01(0.2126 * r + 0.7152 * g + 0.0722 * b);
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * If `text` does not meet the requested contrast against `surface`, return a
 * high-contrast fallback (hard-black or hard-white depending on surface
 * luminance). Otherwise return `text` unchanged.
 *
 * `kind` picks between the strong and muted fallback colors.
 */
export function ensureContrast(
  text: string,
  surface: string,
  kind: 'strong' | 'muted' = 'strong',
  minRatio = 4.5,
): string {
  if (contrastRatio(text, surface) >= minRatio) return text;
  const surfaceIsDark = relativeLuminance(surface) < 0.5;
  if (kind === 'strong') return surfaceIsDark ? HARD_WHITE : HARD_BLACK;
  return surfaceIsDark ? SOFT_WHITE : SOFT_BLACK;
}
