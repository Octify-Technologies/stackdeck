import { z } from 'zod';

export const IR_VERSION = '2.0' as const;

const HEX = /^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/;
const HexColorSchema = z.string().regex(HEX, 'expected hex color like #RRGGBB or #RRGGBBAA');

const TONES = ['info', 'warn', 'success', 'neutral'] as const;

export const LAYOUT_IDS = [
  'flow',
  'hero',
  'cover',
  'section',
  'split',
  'columns',
  'grid',
  'fullBleed',
] as const;

export const DENSITIES = ['dense', 'comfortable', 'airy', 'spacious'] as const;
export const MODES = ['light', 'dark'] as const;
const ASPECT_RATIOS = ['16:9'] as const;

export type Density = (typeof DENSITIES)[number];
export type Mode = (typeof MODES)[number];
type AspectRatio = (typeof ASPECT_RATIOS)[number];
export type LayoutId = (typeof LAYOUT_IDS)[number];
export type Tone = (typeof TONES)[number];

export type Heading = {
  type: 'heading';
  level: 1 | 2 | 3 | 4;
  text: string;
};

export type Text = {
  type: 'text';
  text: string;
  emphasis: 'normal' | 'lead' | 'caption';
};

export type ListItem = {
  text: string;
  children?: ListItem[];
};

export type List = {
  type: 'list';
  ordered: boolean;
  items: ListItem[];
};

export type Quote = {
  type: 'quote';
  text: string;
  attribution?: string;
  emphasis: 'normal' | 'big';
};

export type Stat = {
  type: 'stat';
  value: string;
  label?: string;
  delta?: string;
  trend?: 'up' | 'down' | 'flat';
};

export type Code = {
  type: 'code';
  language?: string;
  content: string;
};

export type Box = {
  type: 'box';
  tone?: Tone;
  children: Block[];
};

export type Columns = {
  type: 'columns';
  count: 2 | 3;
  columns: Block[][];
};

export type Grid = {
  type: 'grid';
  cols: 2 | 3 | 4;
  rows: 1 | 2 | 3;
  children: Block[];
};

export type Block = Heading | Text | List | Quote | Stat | Code | Box | Columns | Grid;

const HeadingSchema: z.ZodType<Heading> = z.object({
  type: z.literal('heading'),
  level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  text: z.string().min(1),
});

const TextSchema: z.ZodType<Text> = z.object({
  type: z.literal('text'),
  text: z.string().min(1),
  emphasis: z.enum(['normal', 'lead', 'caption']),
});

const ListItemSchema: z.ZodType<ListItem> = z.lazy(() =>
  z.object({
    text: z.string().min(1),
    children: z.array(ListItemSchema).optional(),
  }),
);

const ListSchema: z.ZodType<List> = z.object({
  type: z.literal('list'),
  ordered: z.boolean(),
  items: z.array(ListItemSchema).min(1),
});

const QuoteSchema: z.ZodType<Quote> = z.object({
  type: z.literal('quote'),
  text: z.string().min(1),
  attribution: z.string().optional(),
  emphasis: z.enum(['normal', 'big']),
});

const StatSchema: z.ZodType<Stat> = z.object({
  type: z.literal('stat'),
  value: z.string().min(1),
  label: z.string().optional(),
  delta: z.string().optional(),
  trend: z.enum(['up', 'down', 'flat']).optional(),
});

const CodeSchema: z.ZodType<Code> = z.object({
  type: z.literal('code'),
  language: z.string().optional(),
  content: z.string(),
});

const BlockSchema: z.ZodType<Block> = z.lazy(() =>
  z.union([
    HeadingSchema,
    TextSchema,
    ListSchema,
    QuoteSchema,
    StatSchema,
    CodeSchema,
    BoxSchema,
    ColumnsSchema,
    GridSchema,
  ]),
);

const BoxSchema: z.ZodType<Box> = z.lazy(() =>
  z.object({
    type: z.literal('box'),
    tone: z.enum(TONES).optional(),
    children: z.array(BlockSchema).min(1),
  }),
);

const ColumnsSchema: z.ZodType<Columns> = z.lazy(() =>
  z.object({
    type: z.literal('columns'),
    count: z.union([z.literal(2), z.literal(3)]),
    columns: z.array(z.array(BlockSchema)),
  }),
);

const GridSchema: z.ZodType<Grid> = z.lazy(() =>
  z.object({
    type: z.literal('grid'),
    cols: z.union([z.literal(2), z.literal(3), z.literal(4)]),
    rows: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    children: z.array(BlockSchema).min(1),
  }),
);

const LayoutIdSchema = z.enum(LAYOUT_IDS);

export type Slide = {
  id: string;
  layout: LayoutId;
  blocks: Block[];
  notes?: string;
};

const SlideSchema: z.ZodType<Slide> = z.object({
  id: z.string().min(1),
  layout: LayoutIdSchema,
  blocks: z.array(BlockSchema),
  notes: z.string().optional(),
});

export type ColorTokens = {
  brand: string;
  accent: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textMuted: string;
  border: string;
  success: string;
  warn: string;
  danger: string;
};

const ColorTokensSchema: z.ZodType<ColorTokens> = z.object({
  brand: HexColorSchema,
  accent: HexColorSchema,
  surface: HexColorSchema,
  surfaceMuted: HexColorSchema,
  text: HexColorSchema,
  textMuted: HexColorSchema,
  border: HexColorSchema,
  success: HexColorSchema,
  warn: HexColorSchema,
  danger: HexColorSchema,
});

type TypographyScale = {
  family: string;
  weight: number;
  scaleStep: number;
  tracking?: number;
  leading?: number;
};

const TypographyScaleSchema: z.ZodType<TypographyScale> = z.object({
  family: z.string().min(1),
  weight: z.number().int().min(100).max(900),
  scaleStep: z.number(),
  tracking: z.number().optional(),
  leading: z.number().optional(),
});

export type Style = {
  id: string;
  name: string;
  description?: string;
  typography: {
    display: TypographyScale;
    body: TypographyScale;
    mono?: TypographyScale;
  };
  colors: { light: ColorTokens; dark: ColorTokens };
  radius: { sm: number; md: number; lg: number };
  shadow: { light: Record<string, string>; dark: Record<string, string> };
  motion: { duration: Record<string, number>; easing: Record<string, string> };
  spacingBase: number;
  printSafe: boolean;
};

const StyleSchema: z.ZodType<Style> = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  typography: z.object({
    display: TypographyScaleSchema,
    body: TypographyScaleSchema,
    mono: TypographyScaleSchema.optional(),
  }),
  colors: z.object({ light: ColorTokensSchema, dark: ColorTokensSchema }),
  radius: z.object({ sm: z.number(), md: z.number(), lg: z.number() }),
  shadow: z.object({
    light: z.record(z.string(), z.string()),
    dark: z.record(z.string(), z.string()),
  }),
  motion: z.object({
    duration: z.record(z.string(), z.number()),
    easing: z.record(z.string(), z.string()),
  }),
  spacingBase: z.number().positive(),
  printSafe: z.boolean(),
});

export type Palette = {
  id: string;
  name: string;
  brand: string;
  accent: string;
  surface?: string;
  surfaceMuted?: string;
  text?: string;
  textMuted?: string;
  border?: string;
};

const PaletteSchema: z.ZodType<Palette> = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  brand: HexColorSchema,
  accent: HexColorSchema,
  surface: HexColorSchema.optional(),
  surfaceMuted: HexColorSchema.optional(),
  text: HexColorSchema.optional(),
  textMuted: HexColorSchema.optional(),
  border: HexColorSchema.optional(),
});

export type ThemeRef = {
  styleId: string;
  paletteId: string;
  density: Density;
  mode: Mode;
};

const ThemeRefSchema: z.ZodType<ThemeRef> = z.object({
  styleId: z.string().min(1),
  paletteId: z.string().min(1),
  density: z.enum(DENSITIES),
  mode: z.enum(MODES),
});

export const LOGO_POSITIONS = [
  'cover-only',
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
] as const;

type LogoPosition = (typeof LOGO_POSITIONS)[number];

export type Brand = {
  name?: string;
  logoUrl?: string;
  logoDarkUrl?: string;
  logoPosition?: LogoPosition;
  brandColor?: string;
  accentColor?: string;
};

const BrandSchema: z.ZodType<Brand> = z.object({
  name: z.string().min(1).optional(),
  logoUrl: z.string().url().optional(),
  logoDarkUrl: z.string().url().optional(),
  logoPosition: z.enum(LOGO_POSITIONS).optional(),
  brandColor: HexColorSchema.optional(),
  accentColor: HexColorSchema.optional(),
});

export type Deck = {
  version: typeof IR_VERSION;
  id: string;
  title: string;
  aspectRatio: AspectRatio;
  theme: ThemeRef;
  brand?: Brand;
  slides: Slide[];
  createdAt: string;
  updatedAt: string;
};

const DeckSchema: z.ZodType<Deck> = z.object({
  version: z.literal(IR_VERSION),
  id: z.string().min(1),
  title: z.string().min(1),
  aspectRatio: z.enum(ASPECT_RATIOS),
  theme: ThemeRefSchema,
  brand: BrandSchema.optional(),
  slides: z.array(SlideSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

type ValidationResult<T> = { ok: true; value: T } | { ok: false; errors: string[] };

function formatErrors(error: z.ZodError): string[] {
  return error.issues.map((i) => {
    const path = i.path.length ? i.path.join('.') : '<root>';
    return `${path}: ${i.message}`;
  });
}

function validate<T>(schema: z.ZodType<T>, input: unknown): ValidationResult<T> {
  const r = schema.safeParse(input);
  return r.success ? { ok: true, value: r.data } : { ok: false, errors: formatErrors(r.error) };
}

export const validateDeck = (input: unknown) => validate(DeckSchema, input);
export const validateSlide = (input: unknown) => validate(SlideSchema, input);
export const validateBlock = (input: unknown) => validate(BlockSchema, input);
export const validateStyle = (input: unknown) => validate(StyleSchema, input);
export const validatePalette = (input: unknown) => validate(PaletteSchema, input);
