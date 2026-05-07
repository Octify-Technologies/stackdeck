'use client';

import type { Deck, Heading, Slide } from '@/ir/schema';
import { getPalette } from '@/themes/registry';
import { getPreset } from '@/app/presets/presets';
import { getPresetComposer } from '@/presets/registry';

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
  const preset = getPreset(deck.theme.presetId);
  const palette = getPalette(deck.theme.paletteId ?? preset?.paletteId ?? '');
  const sectionContext = computeSectionContext(deck.slides);
  const composer = getPresetComposer(preset?.id);

  return (
    <ThemeProvider theme={deck.theme} preset={preset} palette={palette} brand={deck.brand}>
      <div className={['deck', className].filter(Boolean).join(' ')}>
        {deck.slides.map((slide, i) => {
          const composed = composer
            ? composer(slide, {
                deck,
                index: i,
                total: deck.slides.length,
                section: sectionContext[i],
              })
            : null;
          return (
            <div key={slide.id} className="slide-frame" data-aspect={deck.aspectRatio}>
              <SlideRenderer
                slide={slide}
                index={i}
                totalSlides={deck.slides.length}
                brand={deck.brand}
                footer={deck.footer}
                section={sectionContext[i]}
                composed={composed}
              />
            </div>
          );
        })}
      </div>
    </ThemeProvider>
  );
}
