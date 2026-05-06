import type { Box as BoxBlock } from '@/ir/schema';

import { BlockRenderer } from './BlockRenderer';

export function Box({ block }: { block: BoxBlock }) {
  return (
    <div className={`block block-box block-box-${block.tone ?? 'neutral'}`}>
      {block.children.map((child, idx) => (
        <BlockRenderer key={idx} block={child} />
      ))}
    </div>
  );
}
