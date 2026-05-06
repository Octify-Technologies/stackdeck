import { describe, expect, it } from 'vitest';

import { planDeck } from '@/ir/plan';
import type { Deck, Slide } from '@/ir/schema';
import { IR_VERSION } from '@/ir/schema';

function makeDeck(slides: Slide[]): Deck {
  return {
    version: IR_VERSION,
    id: 'd',
    title: 'T',
    aspectRatio: '16:9',
    theme: { styleId: 'modern', paletteId: 'electric', density: 'comfortable', mode: 'light' },
    slides,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('planDeck', () => {
  it('forces the first slide to cover when shape matches', () => {
    const deck = makeDeck([
      { id: '1', layout: 'flow', blocks: [{ type: 'heading', level: 1, text: 'Hello' }] },
    ]);
    const planned = planDeck(deck);
    expect(planned.slides[0].layout).toBe('cover');
  });

  it('demotes a slide-0 cover when it has too much content', () => {
    const deck = makeDeck([
      {
        id: '1',
        layout: 'cover',
        blocks: [
          { type: 'heading', level: 1, text: 'Big' },
          {
            type: 'list',
            ordered: false,
            items: [{ text: 'a' }, { text: 'b' }, { text: 'c' }, { text: 'd' }],
          },
          { type: 'text', text: 'extra paragraph', emphasis: 'normal' },
          { type: 'text', text: 'another', emphasis: 'normal' },
        ],
      },
    ]);
    const planned = planDeck(deck);
    expect(planned.slides[0].layout).not.toBe('cover');
  });

  it('moves a mid-deck cover-tagged slide to section when it is heading-only', () => {
    const deck = makeDeck([
      { id: '0', layout: 'flow', blocks: [{ type: 'heading', level: 1, text: 'Hello' }] },
      { id: '1', layout: 'cover', blocks: [{ type: 'heading', level: 1, text: 'Section' }] },
    ]);
    const planned = planDeck(deck);
    expect(planned.slides[1].layout).toBe('section');
  });

  it('breaks repeated uncommon layouts', () => {
    const deck = makeDeck([
      { id: '0', layout: 'flow', blocks: [{ type: 'heading', level: 1, text: 'A' }] },
      { id: '1', layout: 'fullBleed', blocks: [{ type: 'quote', text: 'Q1', emphasis: 'big' }] },
      { id: '2', layout: 'fullBleed', blocks: [{ type: 'quote', text: 'Q2', emphasis: 'big' }] },
    ]);
    const planned = planDeck(deck);
    expect(planned.slides[1].layout).toBe('fullBleed');
    expect(planned.slides[2].layout).toBe('flow');
  });

  it('preserves slides untouched by the rules', () => {
    const deck = makeDeck([
      {
        id: '0',
        layout: 'cover',
        blocks: [{ type: 'heading', level: 1, text: 'Title' }],
      },
      {
        id: '1',
        layout: 'flow',
        blocks: [
          { type: 'heading', level: 2, text: 'Body' },
          { type: 'text', text: 'p', emphasis: 'normal' },
        ],
      },
    ]);
    const planned = planDeck(deck);
    expect(planned.slides[0].layout).toBe('cover');
    expect(planned.slides[1].layout).toBe('flow');
  });
});
