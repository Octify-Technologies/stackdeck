'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { Block } from '@/ir/schema';

import { resolveBlockComponent } from './registry';

const StyleIdContext = createContext<string>('modern');

export function StyleIdProvider({ styleId, children }: { styleId: string; children: ReactNode }) {
  return <StyleIdContext.Provider value={styleId}>{children}</StyleIdContext.Provider>;
}

/**
 * Dispatches an IR Block to the right atomic component, looking up per-Style
 * overrides via the registry. The renderer never sees pattern directives, and
 * never branches on Style; it asks the registry what to render.
 */
export function BlockRenderer({ block }: { block: Block }) {
  const styleId = useContext(StyleIdContext);
  switch (block.type) {
    case 'heading': {
      const Comp = resolveBlockComponent('heading', styleId);
      return <Comp block={block} />;
    }
    case 'text': {
      const Comp = resolveBlockComponent('text', styleId);
      return <Comp block={block} />;
    }
    case 'list': {
      const Comp = resolveBlockComponent('list', styleId);
      return <Comp block={block} />;
    }
    case 'quote': {
      const Comp = resolveBlockComponent('quote', styleId);
      return <Comp block={block} />;
    }
    case 'stat': {
      const Comp = resolveBlockComponent('stat', styleId);
      return <Comp block={block} />;
    }
    case 'code': {
      const Comp = resolveBlockComponent('code', styleId);
      return <Comp block={block} />;
    }
    case 'chart': {
      const Comp = resolveBlockComponent('chart', styleId);
      return <Comp block={block} />;
    }
    case 'table': {
      const Comp = resolveBlockComponent('table', styleId);
      return <Comp block={block} />;
    }
    case 'box': {
      const Comp = resolveBlockComponent('box', styleId);
      return <Comp block={block} />;
    }
    case 'columns': {
      const Comp = resolveBlockComponent('columns', styleId);
      return <Comp block={block} />;
    }
    case 'grid': {
      const Comp = resolveBlockComponent('grid', styleId);
      return <Comp block={block} />;
    }
    case 'cell': {
      const Comp = resolveBlockComponent('cell', styleId);
      return <Comp block={block} />;
    }
    case 'image': {
      const Comp = resolveBlockComponent('image', styleId);
      return <Comp block={block} />;
    }
    default: {
      const _exhaustive: never = block;
      void _exhaustive;
      return null;
    }
  }
}
