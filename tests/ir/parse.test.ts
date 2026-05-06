import { describe, expect, it } from 'vitest';

import { parseDeck } from '@/ir/parse';
import type { Box, Columns, Grid, Heading, Quote, Stat } from '@/ir/schema';

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
});
