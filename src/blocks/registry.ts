import type { ComponentType } from 'react';

import type { Block } from '@/ir/schema';

import { Box } from './default/Box';
import { Cell } from './default/Cell';
import { Chart } from './default/Chart';
import { Code } from './default/Code';
import { Columns } from './default/Columns';
import { Grid } from './default/Grid';
import { Heading as DefaultHeading } from './default/Heading';
import { Image } from './default/Image';
import { List } from './default/List';
import { Quote as DefaultQuote } from './default/Quote';
import { Stat as DefaultStat } from './default/Stat';
import { Table } from './default/Table';
import { Text } from './default/Text';

import { Heading as BrutalistHeading } from './brutalist/Heading';
import { Quote as BrutalistQuote } from './brutalist/Quote';
import { Stat as BrutalistStat } from './brutalist/Stat';

import { Quote as EditorialQuote } from './editorial/Quote';
import { Stat as EditorialStat } from './editorial/Stat';

import { Stat as SoftStat } from './soft/Stat';

type BlockType = Block['type'];
type BlockOf<T extends BlockType> = Extract<Block, { type: T }>;
type BlockComponent<T extends BlockType> = ComponentType<{ block: BlockOf<T> }>;

type Registry = {
  [K in BlockType]: {
    default: BlockComponent<K>;
    overrides?: Record<string, BlockComponent<K>>;
  };
};

/**
 * Maps each block type to a default renderer plus optional per-Style overrides.
 * Style authors override only the primitives they want to look *fundamentally
 * different*; everything else falls through to default. The renderer never
 * branches on Style; it just looks up the right component.
 */
const blockRegistry: Registry = {
  heading: {
    default: DefaultHeading,
    overrides: {
      brutalist: BrutalistHeading,
    },
  },
  text: { default: Text },
  list: { default: List },
  quote: {
    default: DefaultQuote,
    overrides: {
      brutalist: BrutalistQuote,
      editorial: EditorialQuote,
    },
  },
  stat: {
    default: DefaultStat,
    overrides: {
      brutalist: BrutalistStat,
      editorial: EditorialStat,
      soft: SoftStat,
    },
  },
  code: { default: Code },
  chart: { default: Chart },
  table: { default: Table },
  box: { default: Box },
  columns: { default: Columns },
  grid: { default: Grid },
  cell: { default: Cell },
  image: { default: Image },
};

export function resolveBlockComponent<T extends BlockType>(
  type: T,
  styleId: string,
): BlockComponent<T> {
  const entry = blockRegistry[type];
  return (entry.overrides?.[styleId] as BlockComponent<T> | undefined) ?? entry.default;
}
