import type { Stat as StatBlock } from '@/ir/schema';

export function Stat({ block }: { block: StatBlock }) {
  return (
    <div className="block block-stat">
      <div className="block-stat-value">{block.value}</div>
      {block.label ? <div className="block-stat-label">{block.label}</div> : null}
      {block.delta ? (
        <div className={`block-stat-delta block-stat-delta-${block.trend ?? 'flat'}`}>
          {block.delta}
        </div>
      ) : null}
    </div>
  );
}
