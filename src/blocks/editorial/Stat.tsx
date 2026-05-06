import type { Stat as StatBlock } from '@/ir/schema';

/**
 * Editorial Stat: NO card. Massive serif numeral with italic label beside it,
 * vertical hairline rule separating. Magazine-grade.
 */
export function Stat({ block }: { block: StatBlock }) {
  return (
    <div className="block block-stat block-stat--editorial">
      <div className="block-stat__editorial-numeral">{block.value}</div>
      <div className="block-stat__editorial-meta">
        {block.label ? <div className="block-stat__editorial-label">{block.label}</div> : null}
        {block.delta ? (
          <div
            className={`block-stat__editorial-delta block-stat__editorial-delta--${
              block.trend ?? 'flat'
            }`}
          >
            {block.delta}
          </div>
        ) : null}
      </div>
    </div>
  );
}
