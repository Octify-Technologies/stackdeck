import type { Grid as GridBlock } from '@/ir/schema';

import { BlockRenderer } from '../BlockRenderer';

export function Grid({ block }: { block: GridBlock }) {
  return (
    <div className="block block-grid" data-cols={block.cols} data-rows={block.rows}>
      {block.children.map((child, idx) => (
        <BlockRenderer key={idx} block={child} />
      ))}
    </div>
  );
}
