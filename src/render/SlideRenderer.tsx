import { BlockRenderer } from '@/blocks';
import type { Brand, Slide } from '@/ir/schema';
import { getLayout } from '@/layouts';

import { SlideLogo } from './SlideLogo';

type Props = {
  slide: Slide;
  index: number;
  totalSlides: number;
  brand?: Brand;
  footer?: string;
  section?: string;
};

const FURNITURE_HIDDEN = new Set(['cover', 'fullBleed', 'section']);

export function SlideRenderer({ slide, index, totalSlides, brand, footer, section }: Props) {
  const layout = getLayout(slide.layout);
  const pageNumber = `${String(index + 1).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')}`;
  const showFurniture = !FURNITURE_HIDDEN.has(slide.layout);

  return (
    <section
      className={`slide ${layout.className}`}
      data-slide-index={index}
      data-layout={slide.layout}
      data-page={pageNumber}
    >
      <div className="slide-bg" aria-hidden="true" />
      {showFurniture && section ? <div className="slide-kicker">{section}</div> : null}
      {slide.blocks.map((block, i) => (
        <BlockRenderer key={i} block={block} />
      ))}
      <SlideLogo brand={brand} layout={slide.layout} />
      {showFurniture && footer ? <div className="slide-footer">{footer}</div> : null}
    </section>
  );
}
