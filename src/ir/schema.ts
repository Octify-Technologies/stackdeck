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
  cols: 2 | 3 | 4 | 6 | 12;
  rows: 1 | 2 | 3 | 4;
  children: Block[];
};

export type Cell = {
  type: 'cell';
  span?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  rowSpan?: 1 | 2 | 3 | 4;
  children: Block[];
};

export type ImageTreatment =
  | 'plain'
  | 'frame'
  | 'bleed'
  | 'duotone'
  | 'bw'
  | 'polaroid'
  | 'hard-frame'
  | 'mask';

export type Image = {
  type: 'image';
  src: string;
  alt?: string;
  caption?: string;
  /** Aspect ratio expressed as "W:H" or "W/H". Defaults to natural. */
  aspectRatio?: string;
  /** Focal point for crops, "x% y%". Defaults to "50% 50%". */
  focal?: string;
  treatment?: ImageTreatment;
  /** Optional list of {x, y, label} annotations rendered over the image. */
  annotations?: ImageAnnotation[];
};

export type ImageAnnotation = {
  /** "x%" position from left. */
  x: string;
  /** "y%" position from top. */
  y: string;
  label: string;
};

export type ChartKind = 'bar' | 'line' | 'donut';

export type ChartDatum = {
  label: string;
  value: number;
};

export type Chart = {
  type: 'chart';
  kind: ChartKind;
  title?: string;
  data: ChartDatum[];
  format?: 'number' | 'percent' | 'currency';
  prefix?: string;
  suffix?: string;
};

export type Table = {
  type: 'table';
  headers: string[];
  rows: string[][];
  emphasizeColumn?: number;
};

export type Block =
  | Heading
  | Text
  | List
  | Quote
  | Stat
  | Code
  | Box
  | Columns
  | Grid
  | Cell
  | Chart
  | Table
  | Image;

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

const ChartDatumSchema: z.ZodType<ChartDatum> = z.object({
  label: z.string().min(1),
  value: z.number(),
});

const ChartSchema: z.ZodType<Chart> = z.object({
  type: z.literal('chart'),
  kind: z.enum(['bar', 'line', 'donut']),
  title: z.string().optional(),
  data: z.array(ChartDatumSchema).min(1),
  format: z.enum(['number', 'percent', 'currency']).optional(),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
});

const TableSchema: z.ZodType<Table> = z.object({
  type: z.literal('table'),
  headers: z.array(z.string()).min(1),
  rows: z.array(z.array(z.string())).min(1),
  emphasizeColumn: z.number().int().nonnegative().optional(),
});

const BlockSchema: z.ZodType<Block> = z.lazy(() =>
  z.union([
    HeadingSchema,
    TextSchema,
    ListSchema,
    QuoteSchema,
    StatSchema,
    CodeSchema,
    ChartSchema,
    TableSchema,
    BoxSchema,
    ColumnsSchema,
    GridSchema,
    CellSchema,
    ImageSchema,
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
    cols: z.union([z.literal(2), z.literal(3), z.literal(4), z.literal(6), z.literal(12)]),
    rows: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    children: z.array(BlockSchema).min(1),
  }),
);

const ImageAnnotationSchema: z.ZodType<ImageAnnotation> = z.object({
  x: z.string().min(1),
  y: z.string().min(1),
  label: z.string().min(1),
});

const ImageSchema: z.ZodType<Image> = z.object({
  type: z.literal('image'),
  src: z.string().min(1),
  alt: z.string().optional(),
  caption: z.string().optional(),
  aspectRatio: z.string().optional(),
  focal: z.string().optional(),
  treatment: z
    .enum(['plain', 'frame', 'bleed', 'duotone', 'bw', 'polaroid', 'hard-frame', 'mask'])
    .optional(),
  annotations: z.array(ImageAnnotationSchema).optional(),
});

const CellSchema: z.ZodType<Cell> = z.lazy(() =>
  z.object({
    type: z.literal('cell'),
    span: z
      .union([
        z.literal(1),
        z.literal(2),
        z.literal(3),
        z.literal(4),
        z.literal(5),
        z.literal(6),
        z.literal(7),
        z.literal(8),
        z.literal(9),
        z.literal(10),
        z.literal(11),
        z.literal(12),
      ])
      .optional(),
    rowSpan: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional(),
    children: z.array(BlockSchema),
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

/**
 * A Palette is the full color theme — light and dark color tokens. It is the
 * only color source. Presets pick a default Palette, and decks may override it.
 */
export type Palette = {
  id: string;
  name: string;
  light: ColorTokens;
  dark: ColorTokens;
};

const PaletteSchema: z.ZodType<Palette> = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  light: ColorTokensSchema,
  dark: ColorTokensSchema,
});

/**
 * Per-deck font overrides. Each slot points at an entry in the font catalog
 * (`src/themes/fonts.ts`). When a slot is omitted, the resolver falls back
 * to the preset's default.
 */
export type FontOverrides = {
  display?: string;
  body?: string;
  mono?: string;
};

export type ThemeRef = {
  presetId: string;
  paletteId: string;
  density: Density;
  mode: Mode;
  fonts?: FontOverrides;
};

const FontOverridesSchema: z.ZodType<FontOverrides> = z.object({
  display: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  mono: z.string().min(1).optional(),
});

const ThemeRefSchema: z.ZodType<ThemeRef> = z.object({
  presetId: z.string().min(1),
  paletteId: z.string().min(1),
  density: z.enum(DENSITIES),
  mode: z.enum(MODES),
  fonts: FontOverridesSchema.optional(),
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
  footer?: string;
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
  footer: z.string().optional(),
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
export const validatePalette = (input: unknown) => validate(PaletteSchema, input);
