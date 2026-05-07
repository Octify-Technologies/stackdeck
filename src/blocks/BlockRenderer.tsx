'use client';

import type { Block } from '@/ir/schema';

import { resolveBlockComponent } from './registry';

/**
 * Dispatches an IR Block to the right atomic component. The renderer never
 * sees pattern directives or preset ids; it just looks up a component.
 */
export function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case 'heading': {
      const Comp = resolveBlockComponent('heading');
      return <Comp block={block} />;
    }
    case 'text': {
      const Comp = resolveBlockComponent('text');
      return <Comp block={block} />;
    }
    case 'list': {
      const Comp = resolveBlockComponent('list');
      return <Comp block={block} />;
    }
    case 'quote': {
      const Comp = resolveBlockComponent('quote');
      return <Comp block={block} />;
    }
    case 'stat': {
      const Comp = resolveBlockComponent('stat');
      return <Comp block={block} />;
    }
    case 'code': {
      const Comp = resolveBlockComponent('code');
      return <Comp block={block} />;
    }
    case 'chart': {
      const Comp = resolveBlockComponent('chart');
      return <Comp block={block} />;
    }
    case 'table': {
      const Comp = resolveBlockComponent('table');
      return <Comp block={block} />;
    }
    case 'box': {
      const Comp = resolveBlockComponent('box');
      return <Comp block={block} />;
    }
    case 'columns': {
      const Comp = resolveBlockComponent('columns');
      return <Comp block={block} />;
    }
    case 'grid': {
      const Comp = resolveBlockComponent('grid');
      return <Comp block={block} />;
    }
    case 'cell': {
      const Comp = resolveBlockComponent('cell');
      return <Comp block={block} />;
    }
    case 'image': {
      const Comp = resolveBlockComponent('image');
      return <Comp block={block} />;
    }
    default: {
      const _exhaustive: never = block;
      void _exhaustive;
      return null;
    }
  }
}
