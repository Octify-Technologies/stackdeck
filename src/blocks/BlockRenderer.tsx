import type { Block } from '@/ir/schema';

import { Box } from './Box';
import { Code } from './Code';
import { Columns } from './Columns';
import { Grid } from './Grid';
import { Heading } from './Heading';
import { List } from './List';
import { Quote } from './Quote';
import { Stat } from './Stat';
import { Text } from './Text';

/**
 * Dispatches an IR Block to the right atomic component. The renderer never
 * sees pattern directives like `::callout` since the parser compiles them
 * into atomic block trees first.
 */
export function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case 'heading':
      return <Heading block={block} />;
    case 'text':
      return <Text block={block} />;
    case 'list':
      return <List block={block} />;
    case 'quote':
      return <Quote block={block} />;
    case 'stat':
      return <Stat block={block} />;
    case 'code':
      return <Code block={block} />;
    case 'box':
      return <Box block={block} />;
    case 'columns':
      return <Columns block={block} />;
    case 'grid':
      return <Grid block={block} />;
    default: {
      // Exhaustiveness check: TS errors if a new block kind is added without a case.
      const _exhaustive: never = block;
      void _exhaustive;
      return null;
    }
  }
}
