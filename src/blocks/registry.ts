import type { ComponentType } from 'react';

import type { Block } from '@/ir/schema';

import { Box } from './default/Box';
import { Cell } from './default/Cell';
import { Chart } from './default/Chart';
import { Code } from './default/Code';
import { Columns } from './default/Columns';
import { Grid } from './default/Grid';
import { Heading } from './default/Heading';
import { Image } from './default/Image';
import { List } from './default/List';
import { Quote } from './default/Quote';
import { Stat } from './default/Stat';
import { Table } from './default/Table';
import { Text } from './default/Text';

type BlockType = Block['type'];
type BlockOf<T extends BlockType> = Extract<Block, { type: T }>;
type BlockComponent<T extends BlockType> = ComponentType<{ block: BlockOf<T> }>;

type Registry = {
  [K in BlockType]: BlockComponent<K>;
};

/**
 * One default renderer per block type. The renderer never branches on
 * preset; visual variation comes from per-preset scoped CSS and bespoke
 * signature components dispatched at the SlideRenderer level.
 */
const blockRegistry: Registry = {
  heading: Heading,
  text: Text,
  list: List,
  quote: Quote,
  stat: Stat,
  code: Code,
  chart: Chart,
  table: Table,
  box: Box,
  columns: Columns,
  grid: Grid,
  cell: Cell,
  image: Image,
};

export function resolveBlockComponent<T extends BlockType>(type: T): BlockComponent<T> {
  return blockRegistry[type];
}
