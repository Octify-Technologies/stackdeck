import type { LayoutId } from '@/ir/schema';

type LayoutDef = {
  id: LayoutId;
  name: string;
  description: string;
  className: string;
  printSafe: boolean;
};

const layouts: Record<LayoutId, LayoutDef> = {
  flow: {
    id: 'flow',
    name: 'Flow',
    description: 'Top-to-bottom stack. Default fallback.',
    className: 'layout-flow',
    printSafe: true,
  },
  hero: {
    id: 'hero',
    name: 'Hero',
    description: 'One dominant block with optional support beneath.',
    className: 'layout-hero',
    printSafe: true,
  },
  cover: {
    id: 'cover',
    name: 'Cover',
    description: 'Deck cover. Big title, generous space.',
    className: 'layout-cover',
    printSafe: true,
  },
  section: {
    id: 'section',
    name: 'Section',
    description: 'Section break between deck parts.',
    className: 'layout-section',
    printSafe: true,
  },
  split: {
    id: 'split',
    name: 'Split',
    description: 'Two-column 50/50 used by compare.',
    className: 'layout-split',
    printSafe: true,
  },
  columns: {
    id: 'columns',
    name: 'Columns',
    description: 'Explicit N-column arrangement.',
    className: 'layout-columns',
    printSafe: true,
  },
  grid: {
    id: 'grid',
    name: 'Grid',
    description: 'Explicit N x M arrangement, used by stats and kpis.',
    className: 'layout-grid',
    printSafe: true,
  },
  fullBleed: {
    id: 'fullBleed',
    name: 'Full Bleed',
    description: 'Single dominant element, edge to edge.',
    className: 'layout-fullbleed',
    printSafe: true,
  },
};

export function getLayout(id: LayoutId): LayoutDef {
  return layouts[id];
}
