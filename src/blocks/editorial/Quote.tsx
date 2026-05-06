import type { Quote as QuoteBlock } from '@/ir/schema';

import { InlineText } from '../InlineText';

export function Quote({ block }: { block: QuoteBlock }) {
  return (
    <figure className={`block block-quote block-quote--editorial block-quote-${block.emphasis}`}>
      <span className="block-quote__editorial-rule" aria-hidden />
      <blockquote>
        <span className="block-quote__editorial-open" aria-hidden>
          “
        </span>
        <InlineText text={block.text} />
        <span className="block-quote__editorial-close" aria-hidden>
          ”
        </span>
      </blockquote>
      {block.attribution ? (
        <figcaption className="block-quote__editorial-attribution">{block.attribution}</figcaption>
      ) : null}
    </figure>
  );
}
