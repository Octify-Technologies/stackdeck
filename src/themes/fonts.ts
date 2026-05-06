/**
 * Catalog of fonts available to any deck. Every entry corresponds to a
 * `next/font` declaration in `src/app/layout.tsx` so the CSS variable resolves
 * at runtime. Add a new entry here AND a matching `next/font` import in
 * `layout.tsx` to expose a new face.
 */
export type FontKind = 'serif' | 'sans' | 'mono';

export type FontDef = {
  id: string;
  name: string;
  /** Full CSS family stack ready to drop into a `font-family` value. */
  family: string;
  kind: FontKind;
};

export const FONTS: FontDef[] = [
  {
    id: 'instrument',
    name: 'Instrument Serif',
    family: 'var(--font-instrument), "Instrument Serif", Georgia, serif',
    kind: 'serif',
  },
  {
    id: 'fraunces',
    name: 'Fraunces',
    family: 'var(--font-fraunces), Fraunces, Georgia, serif',
    kind: 'serif',
  },
  {
    id: 'geist',
    name: 'Geist',
    family: 'var(--font-geist), Geist, system-ui, sans-serif',
    kind: 'sans',
  },
  {
    id: 'inter',
    name: 'Inter',
    family: 'var(--font-inter), Inter, system-ui, sans-serif',
    kind: 'sans',
  },
  {
    id: 'space-grotesk',
    name: 'Space Grotesk',
    family: 'var(--font-space-grotesk), "Space Grotesk", ui-sans-serif, sans-serif',
    kind: 'sans',
  },
  {
    id: 'jetbrains',
    name: 'JetBrains Mono',
    family: 'var(--font-jetbrains), "JetBrains Mono", ui-monospace, monospace',
    kind: 'mono',
  },
];

const byId: Record<string, FontDef> = Object.fromEntries(FONTS.map((f) => [f.id, f]));

export function getFont(id: string | undefined): FontDef | undefined {
  if (!id) return undefined;
  return byId[id];
}

export function fontsByKind(kind: FontKind): FontDef[] {
  return FONTS.filter((f) => f.kind === kind);
}

/** Sans-or-serif fonts are valid for display and body slots. */
export function fontsForRole(role: 'display' | 'body' | 'mono'): FontDef[] {
  if (role === 'mono') return fontsByKind('mono');
  return FONTS.filter((f) => f.kind !== 'mono');
}
