import { describe, expect, it } from 'vitest';

import { parseDeck } from '@/ir/parse';
import type {
  Block,
  Box,
  Chart,
  Columns,
  Grid,
  Heading,
  Quote,
  Stat,
  Table,
  Text,
} from '@/ir/schema';

describe('parseDeck', () => {
  it('parses a minimal deck with one slide', () => {
    const deck = parseDeck('# Hello\n\nA paragraph.');
    expect(deck.slides).toHaveLength(1);
    expect(deck.slides[0].blocks).toHaveLength(2);
    expect(deck.slides[0].blocks[0].type).toBe('heading');
    expect(deck.slides[0].blocks[1].type).toBe('text');
  });

  it('splits slides on ::slide', () => {
    const deck = parseDeck('# A\n\n::slide\n\n# B\n\n::slide\n\n# C');
    expect(deck.slides).toHaveLength(3);
  });

  it('extracts deck title from frontmatter', () => {
    const deck = parseDeck('---\ntitle: Q4 Review\n---\n\n# Other');
    expect(deck.title).toBe('Q4 Review');
  });

  it('falls back to first H1 when no frontmatter title', () => {
    const deck = parseDeck('# My Deck\n\nbody');
    expect(deck.title).toBe('My Deck');
  });

  it('parses a stat directive into a stat block', () => {
    const deck = parseDeck('::stat{value="$3M" label="ARR"}');
    const block = deck.slides[0].blocks[0] as Stat;
    expect(block.type).toBe('stat');
    expect(block.value).toBe('$3M');
    expect(block.label).toBe('ARR');
  });

  it('compiles ::callout into a Box block', () => {
    const deck = parseDeck('::callout{tone=info}\nHello\n::');
    const box = deck.slides[0].blocks[0] as Box;
    expect(box.type).toBe('box');
    expect(box.tone).toBe('info');
    expect(box.children).toHaveLength(1);
    expect(box.children[0].type).toBe('text');
  });

  it('compiles ::compare into a 2-column Columns block', () => {
    const md = '::compare\nLeft side\n:::\nRight side\n::';
    const deck = parseDeck(md);
    const cols = deck.slides[0].blocks[0] as Columns;
    expect(cols.type).toBe('columns');
    expect(cols.count).toBe(2);
    expect(cols.columns).toHaveLength(2);
    expect(cols.columns[0]).toHaveLength(1);
    expect(cols.columns[1]).toHaveLength(1);
  });

  it('compiles ::stats into a Grid of stat blocks', () => {
    const md =
      '::stats\n::stat{value="1" label="A"}\n::stat{value="2" label="B"}\n::stat{value="3" label="C"}\n::';
    const deck = parseDeck(md);
    const grid = deck.slides[0].blocks[0] as Grid;
    expect(grid.type).toBe('grid');
    expect(grid.children).toHaveLength(3);
    expect(grid.children.every((b) => b.type === 'stat')).toBe(true);
  });

  it('recognizes ::quote.big and applies big emphasis', () => {
    const md = '::quote.big\n> The future is here.\n::';
    const deck = parseDeck(md);
    const quote = deck.slides[0].blocks[0] as Quote;
    expect(quote.type).toBe('quote');
    expect(quote.emphasis).toBe('big');
  });

  it('extracts attribution from a blockquote with -- separator', () => {
    const deck = parseDeck('> Hello world\n> -- Anonymous');
    const quote = deck.slides[0].blocks[0] as Quote;
    expect(quote.text).toBe('Hello world');
    expect(quote.attribution).toBe('Anonymous');
  });

  it('infers cover layout for the first slide with a single H1', () => {
    const deck = parseDeck('::cover\n# Hello\n::\n\n::slide\n\n# Next');
    expect(deck.slides[0].layout).toBe('cover');
  });

  it('infers grid layout for ::stats slides', () => {
    const md = '::stats\n::stat{value="1" label="A"}\n::stat{value="2" label="B"}\n::';
    const deck = parseDeck(md);
    expect(deck.slides[0].layout).toBe('grid');
  });

  it('respects an explicit layout option on ::slide', () => {
    const md = '::slide{layout=hero}\n\n# Hello';
    const deck = parseDeck(md);
    expect(deck.slides[0].layout).toBe('hero');
  });

  it('parses a 7-slide deck without throwing', () => {
    const md = `::cover
# Cover
::

::slide

# Highlights

- One
- Two

::slide

::stats
::stat{value="1" label="A"}
::stat{value="2" label="B"}
::

::slide

::compare
Left
:::
Right
::

::slide

::callout{tone=info}
Note.
::

::slide

::section
# Section
::

::slide

::quote.big
> Hello.
::
`;
    const deck = parseDeck(md);
    expect(deck.slides).toHaveLength(7);
    expect(deck.slides.map((s) => s.layout)).toEqual([
      'cover',
      'flow',
      'grid',
      'split',
      'flow',
      'section',
      'fullBleed',
    ]);
  });

  it('recognizes ::section directive even without explicit slide separator', () => {
    const deck = parseDeck('::section\n# Mid Deck\n::');
    expect(deck.slides[0].layout).toBe('section');
    expect((deck.slides[0].blocks[0] as Heading).text).toBe('Mid Deck');
  });

  it('parses a bar chart directive', () => {
    const md = `::chart{kind=bar title="Revenue"}
Q1: 100
Q2: 145
Q3: 190
Q4: 220
::`;
    const deck = parseDeck(md);
    const chart = deck.slides[0].blocks[0] as Chart;
    expect(chart.type).toBe('chart');
    expect(chart.kind).toBe('bar');
    expect(chart.title).toBe('Revenue');
    expect(chart.data).toEqual([
      { label: 'Q1', value: 100 },
      { label: 'Q2', value: 145 },
      { label: 'Q3', value: 190 },
      { label: 'Q4', value: 220 },
    ]);
  });

  it('defaults chart kind to bar when unspecified', () => {
    const deck = parseDeck('::chart\nA: 1\nB: 2\n::');
    const chart = deck.slides[0].blocks[0] as Chart;
    expect(chart.kind).toBe('bar');
  });

  it('parses line and donut chart kinds', () => {
    const line = parseDeck('::chart{kind=line}\nA: 1\nB: 2\n::').slides[0].blocks[0] as Chart;
    const donut = parseDeck('::chart{kind=donut}\nA: 1\nB: 2\n::').slides[0].blocks[0] as Chart;
    expect(line.kind).toBe('line');
    expect(donut.kind).toBe('donut');
  });

  it('parses a table directive', () => {
    const md = `::table{emphasize=1}
| Plan | Price | Seats |
| Starter | $0 | 1 |
| Pro | $20 | 5 |
::`;
    const deck = parseDeck(md);
    const table = deck.slides[0].blocks[0] as Table;
    expect(table.type).toBe('table');
    expect(table.headers).toEqual(['Plan', 'Price', 'Seats']);
    expect(table.rows).toEqual([
      ['Starter', '$0', '1'],
      ['Pro', '$20', '5'],
    ]);
    expect(table.emphasizeColumn).toBe(1);
  });

  it('skips a markdown alignment row in tables', () => {
    const md = `::table
| H1 | H2 |
| -- | -- |
| a | b |
::`;
    const deck = parseDeck(md);
    const table = deck.slides[0].blocks[0] as Table;
    expect(table.headers).toEqual(['H1', 'H2']);
    expect(table.rows).toEqual([['a', 'b']]);
  });

  it('compiles ::scope-strip into a 3-column Columns block', () => {
    const md = '::scope-strip{industry="SaaS" region="EU" timeframe="Q3 2026"}\n::';
    const deck = parseDeck(md);
    const cols = deck.slides[0].blocks[0] as Columns;
    expect(cols.type).toBe('columns');
    expect(cols.count).toBe(3);
    expect(cols.columns[0][0]).toMatchObject({
      type: 'text',
      emphasis: 'caption',
      text: 'Industry',
    });
    expect(cols.columns[0][1]).toMatchObject({ type: 'text', text: 'SaaS' });
  });

  it('compiles ::big-number into a Box with one Stat plus optional source caption', () => {
    const md =
      '::big-number{value="92%" label="Faster" delta="-11m" trend="down" source="Internal CI"}\n::';
    const deck = parseDeck(md);
    const box = deck.slides[0].blocks[0] as Box;
    expect(box.type).toBe('box');
    expect(box.tone).toBe('neutral');
    expect(box.children).toHaveLength(2);
    const stat = box.children[0] as Stat;
    expect(stat.type).toBe('stat');
    expect(stat.value).toBe('92%');
    expect(stat.trend).toBe('down');
    const cap = box.children[1] as Text;
    expect(cap.emphasis).toBe('caption');
    expect(cap.text).toContain('Internal CI');
  });

  it('compiles ::kpi-grid with a source into Grid plus a caption sibling', () => {
    const md = `::kpi-grid{source="2026 numbers"}
::stat{value="1" label="A"}
::stat{value="2" label="B"}
::stat{value="3" label="C"}
::`;
    const deck = parseDeck(md);
    const blocks = deck.slides[0].blocks;
    const grid = blocks[0] as Grid;
    expect(grid.type).toBe('grid');
    expect(grid.children).toHaveLength(3);
    const cap = blocks[1] as Text;
    expect(cap.type).toBe('text');
    expect(cap.emphasis).toBe('caption');
    expect(cap.text).toContain('2026 numbers');
  });

  it('compiles ::problem and ::approach into toned Box with default heading', () => {
    const probDeck = parseDeck('::problem\nThings broke.\n::');
    const prob = probDeck.slides[0].blocks[0] as Box;
    expect(prob.type).toBe('box');
    expect(prob.tone).toBe('warn');
    expect((prob.children[0] as Heading).type).toBe('heading');
    expect((prob.children[0] as Heading).text).toBe('Problem');

    const apprDeck = parseDeck('::approach\nWe fixed it.\n::');
    const appr = apprDeck.slides[0].blocks[0] as Box;
    expect(appr.tone).toBe('info');
    expect((appr.children[0] as Heading).text).toBe('Approach');
  });

  it('compiles ::before-after into 2-column Columns of toned Boxes', () => {
    const md = '::before-after\nOld.\n:::\nNew.\n::';
    const deck = parseDeck(md);
    const cols = deck.slides[0].blocks[0] as Columns;
    expect(cols.type).toBe('columns');
    expect(cols.count).toBe(2);
    const left = cols.columns[0][0] as Box;
    const right = cols.columns[1][0] as Box;
    expect(left.tone).toBe('warn');
    expect(right.tone).toBe('success');
  });

  it('compiles ::testimonial into a neutral Box wrapping a Quote with attribution', () => {
    const md = '::testimonial{name="Priya" role="VP Eng" company="Northwind"}\n> Great work.\n::';
    const deck = parseDeck(md);
    const box = deck.slides[0].blocks[0] as Box;
    expect(box.type).toBe('box');
    expect(box.tone).toBe('neutral');
    const q = box.children[0] as Quote;
    expect(q.type).toBe('quote');
    expect(q.attribution).toBe('Priya, VP Eng, Northwind');
  });

  it('compiles ::pull-quote into a big-emphasis Quote', () => {
    const md = '::pull-quote\n> A quieter signal.\n> -- A.D.\n::';
    const deck = parseDeck(md);
    const q = deck.slides[0].blocks[0] as Quote;
    expect(q.type).toBe('quote');
    expect(q.emphasis).toBe('big');
  });

  it('compiles ::tear-sheet into a 2x2 Grid of label+value text pairs', () => {
    const md =
      '::tear-sheet{client="Northwind" engagement="Pipeline" outcome="Faster" date="Q2 2026"}\n::';
    const deck = parseDeck(md);
    const grid = deck.slides[0].blocks[0] as Grid;
    expect(grid.type).toBe('grid');
    expect(grid.cols).toBe(2);
    expect(grid.rows).toBe(2);
    expect(grid.children).toHaveLength(8);
    expect((grid.children[0] as Text).emphasis).toBe('caption');
    expect((grid.children[1] as Text).text).toBe('Northwind');
  });

  it('compiles ::contact into a 2-column Columns', () => {
    const md = '::contact{name="Riley" role="Principal" email="riley@x.com" url="x.com"}\n::';
    const deck = parseDeck(md);
    const cols = deck.slides[0].blocks[0] as Columns;
    expect(cols.type).toBe('columns');
    expect(cols.count).toBe(2);
    expect((cols.columns[0][0] as Heading).text).toBe('Riley');
    expect((cols.columns[1][0] as Text).text).toBe('riley@x.com');
  });

  it('infers stat trend up from a delta with leading +', () => {
    const deck = parseDeck('::stat{value="$3M" label="ARR" delta="+47%"}');
    const stat = deck.slides[0].blocks[0] as Stat;
    expect(stat.trend).toBe('up');
  });

  it('infers stat trend down from a delta with leading -', () => {
    const deck = parseDeck('::stat{value="2m" label="Latency" delta="-58%"}');
    const stat = deck.slides[0].blocks[0] as Stat;
    expect(stat.trend).toBe('down');
  });

  it('keeps explicit trend over inferred one', () => {
    const deck = parseDeck('::stat{value="x" delta="-1%" trend="up"}');
    const stat = deck.slides[0].blocks[0] as Stat;
    expect(stat.trend).toBe('up');
  });

  it('reads deck footer from frontmatter', () => {
    const md = `---\nfooter: ACME · Confidential\n---\n\n# Hello`;
    const deck = parseDeck(md);
    expect(deck.footer).toBe('ACME · Confidential');
  });

  it('does not set deck.footer when frontmatter omits it', () => {
    const deck = parseDeck('# Hello');
    expect(deck.footer).toBeUndefined();
  });

  it('premium directives compile to atomic IR only (no leftover directive types)', () => {
    const md = `::cover
# Title
::

::slide

::scope-strip{industry="SaaS" region="EU" timeframe="2026"}
::

::slide

::big-number{value="92%" label="Faster"}
::

::slide

::problem
Bad.
::

::slide

::before-after
A
:::
B
::

::slide

::testimonial{name="X" company="Y"}
> Good.
::

::slide

::tear-sheet{client="A" engagement="B" outcome="C" date="D"}
::

::slide

::contact{name="N" email="e@x.com"}
::
`;
    const deck = parseDeck(md);
    const ATOMIC_TYPES = new Set([
      'heading',
      'text',
      'list',
      'quote',
      'stat',
      'code',
      'box',
      'columns',
      'grid',
      'chart',
      'table',
    ]);
    const walk = (b: Block): void => {
      expect(ATOMIC_TYPES.has(b.type)).toBe(true);
      if (b.type === 'box') b.children.forEach(walk);
      if (b.type === 'columns') b.columns.forEach((col) => col.forEach(walk));
      if (b.type === 'grid') b.children.forEach(walk);
    };
    deck.slides.forEach((s) => s.blocks.forEach(walk));
  });

  it('parses ::grid with extended cols=12 and rows=4', () => {
    const md = '::grid{cols=12 rows=4}\nHello\n::';
    const deck = parseDeck(md);
    const grid = deck.slides[0].blocks[0] as Grid;
    expect(grid.type).toBe('grid');
    expect(grid.cols).toBe(12);
    expect(grid.rows).toBe(4);
  });

  it('parses ::cell with span inside a grid', () => {
    const md = `::grid{cols=12}
::cell{span=8}
Main content.
::
::cell{span=4}
Side note.
::
::`;
    const deck = parseDeck(md);
    const grid = deck.slides[0].blocks[0] as Grid;
    expect(grid.children).toHaveLength(2);
    const c1 = grid.children[0] as import('@/ir/schema').Cell;
    expect(c1.type).toBe('cell');
    expect(c1.span).toBe(8);
    expect((grid.children[1] as import('@/ir/schema').Cell).span).toBe(4);
  });

  it('parses ::cell rowSpan via row option', () => {
    const md = `::grid{cols=4 rows=2}
::cell{span=2 row=2}
Tall.
::
::`;
    const deck = parseDeck(md);
    const grid = deck.slides[0].blocks[0] as Grid;
    const cell = grid.children[0] as import('@/ir/schema').Cell;
    expect(cell.rowSpan).toBe(2);
    expect(cell.span).toBe(2);
  });

  it('parses ::image void directive into an image block', () => {
    const md = '::image{src="/a.jpg" alt="A" caption="Hello" aspect="16:9" focal="40% 30%"}';
    const deck = parseDeck(md);
    const img = deck.slides[0].blocks[0] as import('@/ir/schema').Image;
    expect(img.type).toBe('image');
    expect(img.src).toBe('/a.jpg');
    expect(img.alt).toBe('A');
    expect(img.caption).toBe('Hello');
    expect(img.aspectRatio).toBe('16:9');
    expect(img.focal).toBe('40% 30%');
    expect(img.treatment).toBe('plain');
  });

  it('::asset-frame yields image with treatment=frame', () => {
    const md = '::asset-frame{src="/b.png" caption="Diagram"}\n::';
    const deck = parseDeck(md);
    const img = deck.slides[0].blocks[0] as import('@/ir/schema').Image;
    expect(img.type).toBe('image');
    expect(img.treatment).toBe('frame');
    expect(img.caption).toBe('Diagram');
  });

  it('::annotated-image collects annotations from body lines', () => {
    const md = `::annotated-image{src="/c.png" alt="Map"}
- (20%, 30%) Origin
- (75%, 60%) Destination
::`;
    const deck = parseDeck(md);
    const img = deck.slides[0].blocks[0] as import('@/ir/schema').Image;
    expect(img.type).toBe('image');
    expect(img.annotations).toHaveLength(2);
    expect(img.annotations?.[0]).toEqual({ x: '20%', y: '30%', label: 'Origin' });
  });

  it('::image without src returns no block', () => {
    const md = '::image{alt="missing"}';
    const deck = parseDeck(md);
    expect(deck.slides[0].blocks).toHaveLength(0);
  });

  it('::stats with 3 entries lays out as a horizontal row', () => {
    const md = `::stats
::stat{value="1" label="A"}
::stat{value="2" label="B"}
::stat{value="3" label="C"}
::`;
    const deck = parseDeck(md);
    const grid = deck.slides[0].blocks[0] as Grid;
    expect(grid.cols).toBe(3);
    expect(grid.rows).toBe(1);
  });

  it('::stats with 4 entries lays out as 2x2', () => {
    const md = `::stats
::stat{value="1" label="A"}
::stat{value="2" label="B"}
::stat{value="3" label="C"}
::stat{value="4" label="D"}
::`;
    const deck = parseDeck(md);
    const grid = deck.slides[0].blocks[0] as Grid;
    expect(grid.cols).toBe(2);
    expect(grid.rows).toBe(2);
  });

  it('::stats with 6 entries lays out as 3x2', () => {
    const md = `::stats
::stat{value="1" label="A"}
::stat{value="2" label="B"}
::stat{value="3" label="C"}
::stat{value="4" label="D"}
::stat{value="5" label="E"}
::stat{value="6" label="F"}
::`;
    const deck = parseDeck(md);
    const grid = deck.slides[0].blocks[0] as Grid;
    expect(grid.cols).toBe(3);
    expect(grid.rows).toBe(2);
  });

  describe('case-study custom blocks (timeline, process-steps, deliverables, logo-strip)', () => {
    it('::timeline desugars bulleted phases into a grid of boxes', () => {
      const md = `::timeline
- Weeks 1–2: Discovery work
- Weeks 3–5: Build phase
- Weeks 6–10: Launch
- Weeks 11–12: Retro
::`;
      const deck = parseDeck(md);
      const grid = deck.slides[0].blocks[0] as Grid;
      expect(grid.type).toBe('grid');
      expect(grid.children).toHaveLength(4);
      const first = grid.children[0] as Box;
      expect(first.type).toBe('box');
      const caption = first.children[0] as Text;
      expect(caption.text).toBe('Weeks 1–2');
      expect(caption.emphasis).toBe('caption');
      const body = first.children[1] as Text;
      expect(body.text).toBe('Discovery work');
    });

    it('::process-steps numbers each step from 01', () => {
      const md = `::process-steps
- Discover :: shadow recruiters and count handoffs
- Design :: collapse the chain to one record
- Build :: thin orchestration layer
- Launch :: phased rollout by region
::`;
      const deck = parseDeck(md);
      const grid = deck.slides[0].blocks[0] as Grid;
      expect(grid.type).toBe('grid');
      expect(grid.children).toHaveLength(4);
      const step1 = grid.children[0] as Box;
      const num = step1.children[0] as Text;
      const head = step1.children[1] as Heading;
      expect(num.text).toBe('01');
      expect(head.type).toBe('heading');
      expect(head.text).toBe('Discover');
    });

    it('::deliverables groups items under workstream headings into columns', () => {
      const md = `::deliverables
## Recruiter
- One-page hire record
- Auto-routed approvals

## Candidate
- Branded portal
- Pre-day-one provisioning
::`;
      const deck = parseDeck(md);
      const cols = deck.slides[0].blocks[0] as Columns;
      expect(cols.type).toBe('columns');
      expect(cols.count).toBe(2);
      const colA = cols.columns[0][0] as Box;
      const heading = colA.children[0] as Heading;
      expect(heading.text).toBe('Recruiter');
      const firstItem = colA.children[1] as Text;
      expect(firstItem.text.startsWith('✓ ')).toBe(true);
    });

    it('::logo-strip splits the logos attribute into a grid of boxes', () => {
      const md = `::logo-strip{logos="Acme, Globex, Initech, Umbra"}
::`;
      const deck = parseDeck(md);
      const grid = deck.slides[0].blocks[0] as Grid;
      expect(grid.type).toBe('grid');
      expect(grid.children).toHaveLength(4);
      const first = grid.children[0] as Box;
      const text = first.children[0] as Text;
      expect(text.text).toBe('Acme');
      expect(text.emphasis).toBe('caption');
    });
  });
});
