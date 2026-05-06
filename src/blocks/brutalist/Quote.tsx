import type { Quote as QuoteBlock } from '@/ir/schema';

import { InlineText } from '../InlineText';

export function Quote({ block }: { block: QuoteBlock }) {
  return (
    <figure className={`block block-quote block-quote--brutalist block-quote-${block.emphasis}`}>
      <span className="block-quote__open" aria-hidden>
        ❝
      </span>
      <blockquote>
        <InlineText text={block.text} />
      </blockquote>
      {block.attribution ? (
        <figcaption className="block-quote__attribution-brutalist">
          <span aria-hidden>—</span>
          <span>{block.attribution.toUpperCase()}</span>
        </figcaption>
      ) : null}
    </figure>
  );
}
