import type {
  Block,
  Box,
  Chart,
  Columns,
  Grid,
  Heading,
  List,
  Quote,
  Slide,
  Stat,
  Table,
  Text,
} from '@/ir/schema';

/** Find first block of a given type, recursively walking columns/grids/boxes. */
export function findFirst<T extends Block>(blocks: Block[], type: T['type']): T | undefined {
  for (const b of blocks) {
    if (b.type === type) return b as T;
    if (b.type === 'columns') {
      for (const col of (b as Columns).columns) {
        const found = findFirst<T>(col, type);
        if (found) return found;
      }
    }
    if (b.type === 'grid') {
      const found = findFirst<T>((b as Grid).children, type);
      if (found) return found;
    }
    if (b.type === 'box') {
      const found = findFirst<T>((b as Box).children, type);
      if (found) return found;
    }
  }
  return undefined;
}

export function findAllStats(blocks: Block[]): Stat[] {
  const out: Stat[] = [];
  const visit = (list: Block[]) => {
    for (const b of list) {
      if (b.type === 'stat') out.push(b as Stat);
      if (b.type === 'columns') (b as Columns).columns.forEach(visit);
      if (b.type === 'grid') visit((b as Grid).children);
      if (b.type === 'box') visit((b as Box).children);
      if (b.type === 'cell') visit(b.children);
    }
  };
  visit(blocks);
  return out;
}

/** Pull title (h1) and subtitle (lead text or h2) for cover-style slides. */
export function extractTitleSubtitle(slide: Slide): { title?: string; subtitle?: string } {
  const h1 = findFirst<Heading>(slide.blocks, 'heading');
  const title = h1?.level === 1 ? h1.text : undefined;
  const lead = slide.blocks.find((b): b is Text => b.type === 'text' && b.emphasis === 'lead');
  const h2 = slide.blocks.find((b): b is Heading => b.type === 'heading' && b.level === 2);
  const para = slide.blocks.find((b): b is Text => b.type === 'text' && b.emphasis === 'normal');
  return { title, subtitle: lead?.text ?? h2?.text ?? para?.text };
}

/**
 * Hero stat unit parser. Splits a value like "$3.4M" into prefix "$",
 * number "3.4", suffix "M" so the unit chars can be set at 60% size.
 */
export function splitStatValue(raw: string): { prefix?: string; number: string; suffix?: string } {
  const m = /^(\D*?)(\d[\d.,]*)(\D*)$/.exec(raw.trim());
  if (!m) return { number: raw };
  return {
    prefix: m[1] || undefined,
    number: m[2],
    suffix: m[3] || undefined,
  };
}

/** Tear-sheet rows come as alternating caption/body text pairs from the
 * `::tear-sheet{...}` directive expansion. Walk the grid to recover. */
export type TearRow = { label: string; value: string };

export function extractTearRows(slide: Slide): TearRow[] {
  const grid = findFirst<Grid>(slide.blocks, 'grid');
  if (!grid) return [];
  const texts = grid.children.filter((b): b is Text => b.type === 'text');
  const rows: TearRow[] = [];
  for (let i = 0; i + 1 < texts.length; i += 2) {
    if (texts[i].emphasis === 'caption') {
      rows.push({ label: texts[i].text, value: texts[i + 1].text });
    }
  }
  return rows;
}

/** KPI grid stats, with optional source caption. */
export function extractKpis(slide: Slide): { stats: Stat[]; source?: string } {
  const stats = findAllStats(slide.blocks);
  const captions = slide.blocks.filter(
    (b): b is Text => b.type === 'text' && b.emphasis === 'caption',
  );
  const sourceText = captions.find((c) => /^source:/i.test(c.text));
  const source = sourceText?.text.replace(/^source:\s*/i, '');
  return { stats, source };
}

export function extractQuote(slide: Slide): { text: string; attribution?: string } | undefined {
  const q = findFirst<Quote>(slide.blocks, 'quote');
  if (!q) return undefined;
  return { text: q.text, attribution: q.attribution };
}

/** Before/after parses from a 2-column structure where each column is a
 * box (warn=before, success=after). We recover stat + body from each. */
export function extractBeforeAfter(slide: Slide): {
  before: { stat?: string; body?: string; label?: string };
  after: { stat?: string; body?: string; label?: string };
} {
  const cols = findFirst<Columns>(slide.blocks, 'columns');
  const empty = { before: {}, after: {} } as ReturnType<typeof extractBeforeAfter>;
  if (!cols || cols.columns.length < 2) return empty;
  const sideOf = (col: Block[]) => {
    const box = col.find((b): b is Box => b.type === 'box');
    const target = box ? box.children : col;
    const stat = target.find((b): b is Stat => b.type === 'stat');
    const heading = target.find((b): b is Heading => b.type === 'heading');
    const body = target.find((b): b is Text => b.type === 'text' && b.emphasis !== 'caption');
    return {
      stat: stat?.value,
      body: body?.text,
      label: heading?.text,
    };
  };
  return { before: sideOf(cols.columns[0]), after: sideOf(cols.columns[1]) };
}

export function findChart(slide: Slide): Chart | undefined {
  return findFirst<Chart>(slide.blocks, 'chart');
}

export function findTable(slide: Slide): Table | undefined {
  return findFirst<Table>(slide.blocks, 'table');
}

export function findList(slide: Slide): List | undefined {
  return findFirst<List>(slide.blocks, 'list');
}
