import { BlockRenderer } from '@/blocks';
import type { Brand, Mode, Slide } from '@/ir/schema';
import { getLayout } from '@/layouts';

import { SlideLogo } from './SlideLogo';

type Props = {
  slide: Slide;
  index: number;
  brand?: Brand;
  mode: Mode;
};

export function SlideRenderer({ slide, index, brand, mode }: Props) {
  const layout = getLayout(slide.layout);

  return (
    <section
      className={`slide ${layout.className}`}
      data-slide-index={index}
      data-layout={slide.layout}
    >
      {slide.blocks.map((block, i) => (
        <BlockRenderer key={i} block={block} />
      ))}
      <SlideLogo brand={brand} layout={slide.layout} mode={mode} />
    </section>
  );
}
