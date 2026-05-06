import { BlockRenderer } from '@/blocks';
import type { Brand, Mode, Slide } from '@/ir/schema';
import { getLayout } from '@/layouts';

import { SlideLogo } from './SlideLogo';

type Props = {
  slide: Slide;
  index: number;
  totalSlides: number;
  brand?: Brand;
  mode: Mode;
};

export function SlideRenderer({ slide, index, totalSlides, brand, mode }: Props) {
  const layout = getLayout(slide.layout);
  const pageNumber = `${String(index + 1).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')}`;

  return (
    <section
      className={`slide ${layout.className}`}
      data-slide-index={index}
      data-layout={slide.layout}
      data-page={pageNumber}
    >
      {slide.blocks.map((block, i) => (
        <BlockRenderer key={i} block={block} />
      ))}
      <SlideLogo brand={brand} layout={slide.layout} mode={mode} />
    </section>
  );
}
