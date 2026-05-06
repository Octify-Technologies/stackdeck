import type { Text as TextBlock } from '@/ir/schema';

import { InlineText } from './InlineText';

export function Text({ block }: { block: TextBlock }) {
  return (
    <p className={`block block-text block-text-${block.emphasis}`}>
      <InlineText text={block.text} />
    </p>
  );
}
