import type { Cell as CellBlock } from '@/ir/schema';

import { BlockRenderer } from '../BlockRenderer';

export function Cell({ block }: { block: CellBlock }) {
  const style: React.CSSProperties = {};
  if (block.span) style.gridColumn = `span ${block.span}`;
  if (block.rowSpan) style.gridRow = `span ${block.rowSpan}`;
  return (
    <div
      className="block block-cell"
      data-span={block.span ?? undefined}
      data-row-span={block.rowSpan ?? undefined}
      style={style}
    >
      {block.children.map((child, idx) => (
        <BlockRenderer key={idx} block={child} />
      ))}
    </div>
  );
}
