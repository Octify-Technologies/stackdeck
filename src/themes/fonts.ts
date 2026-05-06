/**
 * Catalog of fonts the user can pick from. Each entry corresponds to a
 * `next/font` declaration in `src/app/layout.tsx` so the CSS variable resolves
 * at runtime. Add a new entry here AND a matching `next/font` import in
 * `layout.tsx` to expose a new face. The order here is the order shown in the
 * picker.
 *
 * Catalog is intentionally tight: five modern sans-serif faces, each with a
 * distinct personality but all suited to display+body use in a single-font
 * deck.
 */
export type FontDef = {
  id: string;
  name: string;
  /** Full CSS family stack ready to drop into a `font-family` value. */
  family: string;
};

export const FONTS: FontDef[] = [
  {
    id: 'geist',
    name: 'Geist',
    family: 'var(--font-geist), Geist, system-ui, sans-serif',
  },
  {
    id: 'inter',
    name: 'Inter',
    family: 'var(--font-inter), Inter, system-ui, sans-serif',
  },
  {
    id: 'space-grotesk',
    name: 'Space Grotesk',
    family: 'var(--font-space-grotesk), "Space Grotesk", ui-sans-serif, sans-serif',
  },
  {
    id: 'dm-sans',
    name: 'DM Sans',
    family: 'var(--font-dm-sans), "DM Sans", system-ui, sans-serif',
  },
  {
    id: 'manrope',
    name: 'Manrope',
    family: 'var(--font-manrope), Manrope, system-ui, sans-serif',
  },
];

const byId: Record<string, FontDef> = Object.fromEntries(FONTS.map((f) => [f.id, f]));

export function getFont(id: string | undefined): FontDef | undefined {
  if (!id) return undefined;
  return byId[id];
}
