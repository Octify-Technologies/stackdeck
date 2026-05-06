import type { Stat as StatBlock } from '@/ir/schema';

/**
 * Soft Stat: pill-shaped card with gradient blob backdrop, rounded everything,
 * gentle shadow. Friendly and approachable.
 */
export function Stat({ block }: { block: StatBlock }) {
  return (
    <div className="block block-stat block-stat--soft">
      <div className="block-stat__soft-blob" aria-hidden />
      <div className="block-stat__soft-value">{block.value}</div>
      {block.label ? <div className="block-stat__soft-label">{block.label}</div> : null}
      {block.delta ? (
        <div className={`block-stat__soft-delta block-stat__soft-delta--${block.trend ?? 'flat'}`}>
          {block.delta}
        </div>
      ) : null}
    </div>
  );
}
