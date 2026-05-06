import type { Columns as ColumnsBlock } from '@/ir/schema';

import { BlockRenderer } from '../BlockRenderer';

export function Columns({ block }: { block: ColumnsBlock }) {
  return (
    <div className="block block-columns" data-cols={block.count}>
      {block.columns.map((col, ci) => (
        <div className="block-columns-col" key={ci}>
          {col.map((child, bi) => (
            <BlockRenderer key={bi} block={child} />
          ))}
        </div>
      ))}
    </div>
  );
}
