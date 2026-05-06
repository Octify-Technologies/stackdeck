/**
 * Color utilities. We work in OKLCH for perceptual operations (lightness shifts,
 * harmonic accent picks) and convert back to hex for CSS. Contrast checks
 * use sRGB luminance per WCAG 2.1.
 *
 * No external deps. Pure functions, fully tested.
 */

const HEX_RE = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

type Rgb = { r: number; g: number; b: number };
type Oklch = { l: number; c: number; h: number };

export function isValidHex(input: string): boolean {
  return HEX_RE.test(input.trim());
}

export function hexToRgb(hex: string): Rgb {
  const cleaned = hex.trim().replace(/^#/, '');
  const expanded =
    cleaned.length === 3
      ? cleaned
          .split('')
          .map((c) => c + c)
          .join('')
      : cleaned;
  const num = parseInt(expanded, 16);
  return {
    r: (num >> 16) & 0xff,
    g: (num >> 8) & 0xff,
    b: num & 0xff,
  };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const channel = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, '0');
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

function srgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c: number): number {
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return Math.max(0, Math.min(255, Math.round(v * 255)));
}

function rgbToOklch({ r, g, b }: Rgb): Oklch {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const l_ = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m_ = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s_ = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const c = Math.sqrt(A * A + B * B);
  const h = ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360;
  return { l: L, c, h };
}

export function oklchToHex({ l, c, h }: Oklch): string {
  const hr = (h * Math.PI) / 180;
  const A = c * Math.cos(hr);
  const B = c * Math.sin(hr);

  const l_ = l + 0.3963377774 * A + 0.2158037573 * B;
  const m_ = l - 0.1055613458 * A - 0.0638541728 * B;
  const s_ = l - 0.0894841775 * A - 1.291485548 * B;

  const lr = l_ * l_ * l_;
  const lg = m_ * m_ * m_;
  const lb = s_ * s_ * s_;

  const r = 4.0767416621 * lr - 3.3077115913 * lg + 0.2309699292 * lb;
  const g = -1.2684380046 * lr + 2.6097574011 * lg - 0.3413193965 * lb;
  const b = -0.0041960863 * lr - 0.7034186147 * lg + 1.707614701 * lb;

  return rgbToHex({ r: linearToSrgb(r), g: linearToSrgb(g), b: linearToSrgb(b) });
}

function hexToOklch(hex: string): Oklch {
  return rgbToOklch(hexToRgb(hex));
}

/**
 * Pick a complementary accent for a brand color: rotate hue by 180° and
 * keep similar chroma + lightness. Looks good in most palettes.
 */
export function deriveAccent(brandHex: string): string {
  const oklch = hexToOklch(brandHex);
  return oklchToHex({
    l: oklch.l,
    c: oklch.c,
    h: (oklch.h + 180) % 360,
  });
}

function luminance(rgb: Rgb): number {
  return 0.2126 * srgbToLinear(rgb.r) + 0.7152 * srgbToLinear(rgb.g) + 0.0722 * srgbToLinear(rgb.b);
}

/**
 * Contrast ratio between two colors per WCAG 2.1. Returns a number from 1 to 21.
 * Anything >= 4.5 passes AA for normal text; >= 3 passes AA for large text.
 */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(hexToRgb(a));
  const lb = luminance(hexToRgb(b));
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

type ContrastVerdict = {
  ratio: number;
  passesAA: boolean;
  passesAALarge: boolean;
  passesAAA: boolean;
};

export function checkContrast(foreground: string, background: string): ContrastVerdict {
  const ratio = contrastRatio(foreground, background);
  return {
    ratio,
    passesAA: ratio >= 4.5,
    passesAALarge: ratio >= 3,
    passesAAA: ratio >= 7,
  };
}

/**
 * Pick the better text color (black or white) for the given background.
 */
export function pickReadableText(backgroundHex: string): '#ffffff' | '#0a0a0a' {
  return contrastRatio('#ffffff', backgroundHex) >= contrastRatio('#0a0a0a', backgroundHex)
    ? '#ffffff'
    : '#0a0a0a';
}
