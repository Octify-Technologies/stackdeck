import matter from 'gray-matter';
import { ulid } from 'ulid';
import { marked } from 'marked';

import {
  type Block,
  type Box,
  type Code,
  type Deck,
  type Heading,
  type LayoutId,
  type List,
  type ListItem,
  type Quote,
  type Slide,
  type Stat,
  type Text,
  type ThemeRef,
  type Tone,
  IR_VERSION,
  LAYOUT_IDS,
  validateDeck,
} from './schema';

const DEFAULT_THEME: ThemeRef = {
  styleId: 'modern',
  paletteId: 'electric',
  density: 'comfortable',
  mode: 'light',
};

const VOID_DIRECTIVES = new Set(['stat', 'slide']);

const TONE_VALUES = new Set<Tone>(['info', 'warn', 'success', 'neutral']);

type LineToken =
  | { kind: 'text'; content: string }
  | { kind: 'open'; name: string; options: Record<string, string> }
  | { kind: 'close' }
  | { kind: 'colsep' }
  | { kind: 'void'; name: string; options: Record<string, string> };

const DIRECTIVE_OPEN_RE = /^::([a-zA-Z][a-zA-Z0-9.]*)(\{[^}]*\})?\s*$/;
const DIRECTIVE_CLOSE_RE = /^::\s*$/;
const COLUMN_SEP_RE = /^:::\s*$/;

function parseOptions(raw: string | undefined): Record<string, string> {
  if (!raw) return {};
  const inner = raw.slice(1, -1).trim();
  if (!inner) return {};
  const out: Record<string, string> = {};
  const re = /([a-zA-Z][a-zA-Z0-9_]*)(?:=("([^"]*)"|'([^']*)'|([^\s]+)))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(inner))) {
    const key = m[1];
    const value = m[3] ?? m[4] ?? m[5] ?? '';
    out[key] = value;
  }
  return out;
}

function classifyLine(line: string): LineToken {
  if (DIRECTIVE_CLOSE_RE.test(line)) return { kind: 'close' };
  if (COLUMN_SEP_RE.test(line)) return { kind: 'colsep' };
  const m = DIRECTIVE_OPEN_RE.exec(line);
  if (m) {
    const name = m[1];
    const options = parseOptions(m[2]);
    if (VOID_DIRECTIVES.has(name)) return { kind: 'void', name, options };
    return { kind: 'open', name, options };
  }
  return { kind: 'text', content: line };
}

function splitSlideSections(body: string): string[] {
  const lines = body.split('\n');
  const sections: string[][] = [[]];
  for (const line of lines) {
    const m = DIRECTIVE_OPEN_RE.exec(line);
    if (m && m[1] === 'slide') {
      sections.push([line]);
      continue;
    }
    sections[sections.length - 1].push(line);
  }
  return sections.map((s) => s.join('\n').trim()).filter((s) => s.length > 0);
}

function tokenize(body: string): LineToken[] {
  return body.split('\n').map(classifyLine);
}

type Cursor = { i: number };

function parseChildren(tokens: LineToken[], cursor: Cursor, untilCloseOrColsep: boolean): Block[] {
  const blocks: Block[] = [];
  let textBuffer: string[] = [];

  const flushText = () => {
    if (textBuffer.length === 0) return;
    const md = textBuffer.join('\n').trim();
    textBuffer = [];
    if (md.length === 0) return;
    blocks.push(...markdownToBlocks(md));
  };

  while (cursor.i < tokens.length) {
    const t = tokens[cursor.i];

    if (t.kind === 'close') {
      flushText();
      if (untilCloseOrColsep) {
        cursor.i++;
        return blocks;
      }
      cursor.i++;
      continue;
    }

    if (t.kind === 'colsep') {
      flushText();
      if (untilCloseOrColsep) return blocks;
      cursor.i++;
      continue;
    }

    if (t.kind === 'text') {
      textBuffer.push(t.content);
      cursor.i++;
      continue;
    }

    if (t.kind === 'void') {
      flushText();
      const expanded = expandVoidDirective(t.name, t.options);
      if (expanded) blocks.push(expanded);
      cursor.i++;
      continue;
    }

    if (t.kind === 'open') {
      flushText();
      cursor.i++;
      const directiveName = t.name;
      const expanded = expandBlockDirective(directiveName, t.options, tokens, cursor);
      if (expanded) blocks.push(...expanded);
      continue;
    }
  }

  flushText();
  return blocks;
}

function collectColumnGroups(tokens: LineToken[], cursor: Cursor, count: number): Block[][] {
  const cols: Block[][] = [];
  while (cursor.i < tokens.length) {
    const colBlocks = parseChildren(tokens, cursor, true);
    cols.push(colBlocks);
    const next = tokens[cursor.i];
    if (next?.kind === 'colsep') {
      cursor.i++;
      continue;
    }
    break;
  }
  while (cols.length < count) cols.push([]);
  return cols.slice(0, count);
}

function expandVoidDirective(name: string, options: Record<string, string>): Block | null {
  if (name === 'stat') {
    if (!options.value) return null;
    const trend =
      options.trend === 'up' || options.trend === 'down' || options.trend === 'flat'
        ? (options.trend as Stat['trend'])
        : undefined;
    return {
      type: 'stat',
      value: options.value,
      label: options.label,
      delta: options.delta,
      trend,
    };
  }
  return null;
}

function expandBlockDirective(
  name: string,
  options: Record<string, string>,
  tokens: LineToken[],
  cursor: Cursor,
): Block[] | null {
  if (name === 'callout') {
    const children = parseChildren(tokens, cursor, true);
    const tone: Tone = TONE_VALUES.has(options.tone as Tone) ? (options.tone as Tone) : 'neutral';
    const box: Box = { type: 'box', tone, children };
    return [box];
  }

  if (name === 'box') {
    const children = parseChildren(tokens, cursor, true);
    const tone: Tone | undefined = TONE_VALUES.has(options.tone as Tone)
      ? (options.tone as Tone)
      : undefined;
    return [{ type: 'box', tone, children }];
  }

  if (name === 'columns') {
    const count = options.count === '3' ? 3 : 2;
    const columns: Block[][] = collectColumnGroups(tokens, cursor, count);
    return [{ type: 'columns', count: count as 2 | 3, columns }];
  }

  if (name === 'grid') {
    const cols = (
      options.cols && [2, 3, 4].includes(Number(options.cols)) ? Number(options.cols) : 2
    ) as 2 | 3 | 4;
    const rows = (
      options.rows && [1, 2, 3].includes(Number(options.rows)) ? Number(options.rows) : 2
    ) as 1 | 2 | 3;
    const children = parseChildren(tokens, cursor, true);
    return [{ type: 'grid', cols, rows, children }];
  }

  if (name === 'lead' || name === 'caption') {
    const children = parseChildren(tokens, cursor, true);
    return children.map((b) =>
      b.type === 'text' ? { ...b, emphasis: name === 'lead' ? 'lead' : 'caption' } : b,
    );
  }

  if (name === 'cover' || name === 'section') {
    const children = parseChildren(tokens, cursor, true);
    return children;
  }

  if (name === 'compare') {
    const columns = collectColumnGroups(tokens, cursor, 2);
    return [{ type: 'columns', count: 2, columns }];
  }

  if (name === 'stats' || name === 'kpis') {
    const children = parseChildren(tokens, cursor, true);
    const stats = children.filter((b): b is Stat => b.type === 'stat');
    const cols = pickGridCols(name, stats.length);
    const rows = pickGridRows(name, stats.length, cols);
    return [{ type: 'grid', cols, rows, children: stats }];
  }

  if (name === 'quote.big') {
    const children = parseChildren(tokens, cursor, true);
    const quote = children.find((b): b is Quote => b.type === 'quote');
    if (quote) return [{ ...quote, emphasis: 'big' }];
    return [];
  }

  if (name === 'steps') {
    const children = parseChildren(tokens, cursor, true);
    const list = children.find((b): b is List => b.type === 'list');
    if (list) return [{ ...list, ordered: true }];
    return children;
  }

  if (name === 'timeline') {
    const children = parseChildren(tokens, cursor, true);
    return children;
  }

  if (name === 'agenda') {
    const children = parseChildren(tokens, cursor, true);
    const heading: Heading = { type: 'heading', level: 2, text: 'Agenda' };
    return [heading, ...children];
  }

  const children = parseChildren(tokens, cursor, true);
  return children;
}

function pickGridCols(pattern: string, count: number): 2 | 3 | 4 {
  if (pattern === 'kpis') {
    if (count <= 4) return 2;
    if (count <= 6) return 3;
    return 4;
  }
  if (count <= 2) return 2;
  if (count <= 3) return 3;
  if (count <= 4) return 2;
  if (count <= 6) return 3;
  return 4;
}

function pickGridRows(_pattern: string, count: number, cols: 2 | 3 | 4): 1 | 2 | 3 {
  const rows = Math.ceil(count / cols);
  if (rows <= 1) return 1;
  if (rows >= 3) return 3;
  return 2;
}

function markdownToBlocks(source: string): Block[] {
  const tokens = marked.lexer(source);
  const blocks: Block[] = [];
  for (const tok of tokens) {
    const block = tokenToBlock(tok);
    if (block) blocks.push(block);
  }
  return blocks;
}

type MarkedToken = ReturnType<typeof marked.lexer>[number];

function tokenToBlock(tok: MarkedToken): Block | null {
  if (tok.type === 'heading') {
    const level = Math.max(1, Math.min(4, tok.depth)) as 1 | 2 | 3 | 4;
    return { type: 'heading', level, text: tok.text } satisfies Heading;
  }
  if (tok.type === 'paragraph') {
    return { type: 'text', text: tok.text, emphasis: 'normal' } satisfies Text;
  }
  if (tok.type === 'list') {
    const items = (tok.items as MarkedListItem[]).map((it) => listItemFromToken(it));
    return { type: 'list', ordered: !!tok.ordered, items } satisfies List;
  }
  if (tok.type === 'blockquote') {
    return blockquoteToQuote({ text: (tok as { text?: string }).text ?? '' });
  }
  if (tok.type === 'code') {
    return {
      type: 'code',
      language: tok.lang || undefined,
      content: tok.text,
    } satisfies Code;
  }
  if (tok.type === 'space' || tok.type === 'hr') return null;
  return null;
}

type MarkedListItem = { text: string; tokens?: MarkedToken[] };

function listItemFromToken(item: MarkedListItem): ListItem {
  const text = item.text.split('\n')[0].trim();
  const nested = item.tokens?.find((t) => t.type === 'list') as
    | { items: MarkedListItem[] }
    | undefined;
  return {
    text,
    children: nested ? nested.items.map(listItemFromToken) : undefined,
  };
}

function blockquoteToQuote(tok: { text: string }): Quote {
  const lines = tok.text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  let attribution: string | undefined;
  const bodyLines: string[] = [];
  for (const line of lines) {
    if (line.startsWith('-- ') || line.startsWith('— ')) {
      attribution = line.replace(/^(--|—)\s*/, '').trim();
    } else {
      bodyLines.push(line);
    }
  }
  return {
    type: 'quote',
    text: bodyLines.join(' '),
    attribution,
    emphasis: 'normal',
  };
}

function detectSlideShape(rawSlide: string): {
  patternLayout?: LayoutId;
  patternName?: string;
} {
  const trimmed = rawSlide.trim();
  const m = DIRECTIVE_OPEN_RE.exec(trimmed.split('\n')[0] || '');
  if (!m) return {};
  const name = m[1];
  if (name === 'cover') return { patternLayout: 'cover', patternName: name };
  if (name === 'section') return { patternLayout: 'section', patternName: name };
  if (name === 'compare') return { patternLayout: 'split', patternName: name };
  if (name === 'stats' || name === 'kpis') return { patternLayout: 'grid', patternName: name };
  if (name === 'quote.big') return { patternLayout: 'fullBleed', patternName: name };
  if (name === 'agenda' || name === 'steps' || name === 'timeline') {
    return { patternLayout: 'flow', patternName: name };
  }
  return {};
}

function parseSlideOptions(rawSlide: string): {
  body: string;
  layout?: LayoutId;
  notes?: string;
  nosplit?: boolean;
} {
  const lines = rawSlide.split('\n');
  const first = (lines[0] ?? '').trim();
  const m = DIRECTIVE_OPEN_RE.exec(first);
  if (!m || m[1] !== 'slide') return { body: rawSlide };
  const opts = parseOptions(m[2]);
  const body = lines.slice(1).join('\n');
  return {
    body,
    layout: LAYOUT_IDS.includes(opts.layout as LayoutId) ? (opts.layout as LayoutId) : undefined,
    notes: opts.notes,
    nosplit: 'nosplit' in opts,
  };
}

function inferLayout(blocks: Block[], index: number, totalSlides: number): LayoutId {
  if (blocks.length === 0) return 'flow';

  if (index === 0) {
    const headings = blocks.filter((b): b is Heading => b.type === 'heading');
    if (headings.length === 1 && headings[0].level <= 2 && blocks.length <= 3) return 'cover';
  }

  if (blocks.length === 1) {
    const only = blocks[0];
    if (only.type === 'quote' && only.emphasis === 'big') return 'fullBleed';
    if (only.type === 'stat') return 'hero';
  }

  const onlyHeading = blocks.length === 1 && blocks[0].type === 'heading';
  if (onlyHeading && index > 0 && index < totalSlides - 1) return 'section';

  if (blocks.some((b) => b.type === 'columns')) return 'split';
  if (blocks.some((b) => b.type === 'grid')) return 'grid';

  return 'flow';
}

type ParseOptions = {
  theme?: Partial<ThemeRef>;
  deckId?: string;
  title?: string;
};

export function parseDeck(source: string, options: ParseOptions = {}): Deck {
  const fm = matter(source);
  const sections = splitSlideSections(fm.content);

  const slides: Slide[] = sections.map((section, index) => {
    const { body, layout: explicitLayout, notes } = parseSlideOptions(section);
    const detected = detectSlideShape(body);
    const tokens = tokenize(body);
    const cursor: Cursor = { i: 0 };
    const blocks = parseChildren(tokens, cursor, false);
    const inferred = inferLayout(blocks, index, sections.length);
    const layout = explicitLayout ?? detected.patternLayout ?? inferred;
    return {
      id: ulid(),
      layout,
      blocks,
      notes,
    };
  });

  const fmTheme = (fm.data?.theme ?? {}) as Partial<ThemeRef>;
  const theme: ThemeRef = {
    ...DEFAULT_THEME,
    ...fmTheme,
    ...options.theme,
  };

  const now = new Date().toISOString();
  const headingTitle = slides[0]?.blocks.find(
    (b): b is Heading => b.type === 'heading' && b.level === 1,
  )?.text;
  const title =
    options.title ??
    (typeof fm.data?.title === 'string' ? (fm.data.title as string) : undefined) ??
    headingTitle ??
    'Untitled Deck';

  const deck: Deck = {
    version: IR_VERSION,
    id: options.deckId ?? ulid(),
    title,
    aspectRatio: '16:9',
    theme,
    slides,
    createdAt: now,
    updatedAt: now,
  };

  const validation = validateDeck(deck);
  if (!validation.ok) {
    throw new ParseError('Parsed deck failed schema validation', validation.errors);
  }
  return validation.value;
}

export class ParseError extends Error {
  errors: string[];
  constructor(message: string, errors: string[]) {
    super(`${message}: ${errors.join('; ')}`);
    this.name = 'ParseError';
    this.errors = errors;
  }
}
