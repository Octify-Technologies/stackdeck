import type { Stat as StatBlock } from '@/ir/schema';

/**
 * Brutalist Stat: NO card. A massive numeral, a hard accent slab beneath, label
 * in mono caps. Asymmetric, loud, opinionated.
 */
export function Stat({ block }: { block: StatBlock }) {
  return (
    <div className="block block-stat block-stat--brutalist">
      <div className="block-stat__numeral">{block.value}</div>
      <div className="block-stat__slab" aria-hidden />
      {block.label ? <div className="block-stat__caption">{block.label}</div> : null}
      {block.delta ? (
        <div className={`block-stat__delta block-stat__delta--${block.trend ?? 'flat'}`}>
          {block.delta}
        </div>
      ) : null}
    </div>
  );
}
