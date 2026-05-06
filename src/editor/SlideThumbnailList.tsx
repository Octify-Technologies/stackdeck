'use client';

import type { Deck } from '@/ir/schema';
import { DeckRenderer } from '@/render/DeckRenderer';

type Props = {
  deck: Deck;
  selectedIndex: number;
  onSelect: (index: number) => void;
};

/**
 * Left sidebar showing one mini-rendered slide per deck slide. Clicking a
 * thumbnail scrolls the source editor to that slide and highlights it in
 * the preview.
 */
export function SlideThumbnailList({ deck, selectedIndex, onSelect }: Props) {
  return (
    <nav className="thumb-list" aria-label="Slide navigation">
      {deck.slides.map((slide, i) => {
        const singleSlideDeck: Deck = { ...deck, slides: [slide] };
        const isSelected = i === selectedIndex;
        return (
          <button
            key={slide.id}
            type="button"
            className={`thumb-list__item ${isSelected ? 'thumb-list__item--active' : ''}`}
            onClick={() => onSelect(i)}
            aria-current={isSelected ? 'true' : undefined}
            aria-label={`Slide ${i + 1}`}
          >
            <span className="thumb-list__number">{String(i + 1).padStart(2, '0')}</span>
            <div className="thumb-list__frame">
              <div className="thumb-list__scaler">
                <DeckRenderer deck={singleSlideDeck} className="deck--thumbnail" />
              </div>
            </div>
          </button>
        );
      })}
    </nav>
  );
}
