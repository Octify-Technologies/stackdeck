'use client';

import type { Deck } from '@/ir/schema';
import { getPalette, getStyle } from '@/themes/registry';

import { SlideRenderer } from './SlideRenderer';
import { ThemeProvider } from './ThemeProvider';

type Props = {
  deck: Deck;
  /** Optional CSS class for the outer wrapper. */
  className?: string;
};

export function DeckRenderer({ deck, className }: Props) {
  const style = getStyle(deck.theme.styleId);
  const palette = getPalette(deck.theme.paletteId);

  return (
    <ThemeProvider theme={deck.theme} style={style} palette={palette} brand={deck.brand}>
      <div className={['deck', className].filter(Boolean).join(' ')}>
        {deck.slides.map((slide, i) => (
          <div key={slide.id} className="slide-frame" data-aspect={deck.aspectRatio}>
            <SlideRenderer
              slide={slide}
              index={i}
              totalSlides={deck.slides.length}
              brand={deck.brand}
              mode={deck.theme.mode}
            />
          </div>
        ))}
      </div>
    </ThemeProvider>
  );
}
