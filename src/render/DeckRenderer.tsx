'use client';

import type { Deck, Heading, Slide } from '@/ir/schema';
import { getPalette, getStyle } from '@/themes/registry';

import { SlideRenderer } from './SlideRenderer';
import { ThemeProvider } from './ThemeProvider';

type Props = {
  deck: Deck;
  /** Optional CSS class for the outer wrapper. */
  className?: string;
};

function computeSectionContext(slides: Slide[]): (string | undefined)[] {
  const out: (string | undefined)[] = [];
  let current: string | undefined;
  for (const slide of slides) {
    if (slide.layout === 'section' || slide.layout === 'cover') {
      const h = slide.blocks.find((b): b is Heading => b.type === 'heading' && b.level === 1);
      current = h?.text ?? current;
      out.push(undefined);
    } else {
      out.push(current);
    }
  }
  return out;
}

export function DeckRenderer({ deck, className }: Props) {
  const style = getStyle(deck.theme.styleId);
  const palette = getPalette(deck.theme.paletteId);
  const sectionContext = computeSectionContext(deck.slides);

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
              footer={deck.footer}
              section={sectionContext[i]}
            />
          </div>
        ))}
      </div>
    </ThemeProvider>
  );
}
