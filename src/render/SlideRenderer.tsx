import type { Slide } from '@/ir/schema';
import { getLayout } from '@/layouts';

import { BlockRenderer } from '@/blocks';

export function SlideRenderer({ slide, index }: { slide: Slide; index: number }) {
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
    </section>
  );
}
