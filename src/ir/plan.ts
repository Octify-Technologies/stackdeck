import type { Deck, Heading, LayoutId, Slide } from './schema';

export function planDeck(deck: Deck): Deck {
  const slides = deck.slides.map((s) => ({ ...s }));

  if (slides.length > 0 && hasCoverShape(slides[0])) {
    slides[0] = { ...slides[0], layout: 'cover' };
  } else if (slides.length > 0 && slides[0].layout === 'cover' && !hasCoverShape(slides[0])) {
    slides[0] = { ...slides[0], layout: 'flow' };
  }

  for (let i = 1; i < slides.length; i++) {
    const prev = slides[i - 1];
    const cur = slides[i];

    if (cur.layout === 'cover') {
      slides[i] = { ...cur, layout: pickAlternativeForMidDeck(cur) };
      continue;
    }

    if (
      isUncommonLayout(cur.layout) &&
      isUncommonLayout(prev.layout) &&
      cur.layout === prev.layout
    ) {
      slides[i] = { ...cur, layout: 'flow' };
    }
  }

  return { ...deck, slides };
}

function hasCoverShape(slide: Slide): boolean {
  if (slide.layout !== 'cover' && slide.layout !== 'flow') return false;
  const headings = slide.blocks.filter((b): b is Heading => b.type === 'heading');
  if (headings.length !== 1) return false;
  if (headings[0].level > 2) return false;
  return slide.blocks.length <= 3;
}

function pickAlternativeForMidDeck(slide: Slide): LayoutId {
  if (slide.blocks.length === 1 && slide.blocks[0].type === 'heading') return 'section';
  return 'flow';
}

function isUncommonLayout(layout: LayoutId): boolean {
  return layout === 'fullBleed' || layout === 'cover' || layout === 'section';
}
