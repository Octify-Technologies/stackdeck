import type { Heading as HeadingBlock } from '@/ir/schema';

import { InlineText } from '../InlineText';

export function Heading({ block }: { block: HeadingBlock }) {
  const Tag = `h${block.level}` as 'h1' | 'h2' | 'h3' | 'h4';
  return (
    <Tag className={`block block-heading block-heading--brutalist block-h${block.level}`}>
      {block.level <= 2 ? (
        <span className="block-heading__brutalist-mark" aria-hidden>
          ▣
        </span>
      ) : null}
      <InlineText text={block.text} />
    </Tag>
  );
}
