import type { Quote as QuoteBlock } from '@/ir/schema';

import { InlineText } from '../InlineText';

export function Quote({ block }: { block: QuoteBlock }) {
  return (
    <figure className={`block block-quote block-quote-${block.emphasis}`}>
      <blockquote>
        <InlineText text={block.text} />
      </blockquote>
      {block.attribution ? (
        <figcaption className="block-quote-attribution">— {block.attribution}</figcaption>
      ) : null}
    </figure>
  );
}
