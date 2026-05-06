'use client';

import type { Deck } from '@/ir/schema';
import { getPalette, getStyle } from '@/themes/registry';

import { ThemeProvider } from './ThemeProvider';
import { SlideRenderer } from './SlideRenderer';

export function DeckRenderer({ deck }: { deck: Deck }) {
  const style = getStyle(deck.theme.styleId);
  const palette = getPalette(deck.theme.paletteId);

  return (
    <ThemeProvider theme={deck.theme} style={style} palette={palette}>
      <div className="deck">
        {deck.slides.map((slide, i) => (
          <div key={slide.id} className="slide-frame" data-aspect={deck.aspectRatio}>
            <SlideRenderer slide={slide} index={i} />
          </div>
        ))}
      </div>
    </ThemeProvider>
  );
}
