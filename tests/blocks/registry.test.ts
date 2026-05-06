import { describe, expect, it } from 'vitest';

import { resolveBlockComponent } from '@/blocks/registry';

describe('block registry', () => {
  it('returns the default Stat for unknown styles', () => {
    const Comp = resolveBlockComponent('stat', 'unknown-style');
    expect(Comp).toBeTypeOf('function');
    expect(Comp.name).toMatch(/Stat/);
  });

  it('returns Brutalist Stat when active style is brutalist', () => {
    const Default = resolveBlockComponent('stat', 'modern');
    const Brutalist = resolveBlockComponent('stat', 'brutalist');
    expect(Default).not.toBe(Brutalist);
  });

  it('returns Editorial Stat when active style is editorial', () => {
    const Default = resolveBlockComponent('stat', 'modern');
    const Editorial = resolveBlockComponent('stat', 'editorial');
    expect(Default).not.toBe(Editorial);
  });

  it('returns Soft Stat when active style is soft', () => {
    const Default = resolveBlockComponent('stat', 'modern');
    const Soft = resolveBlockComponent('stat', 'soft');
    expect(Default).not.toBe(Soft);
  });

  it('falls back to default Quote for styles without an override', () => {
    const Default = resolveBlockComponent('quote', 'modern');
    const Soft = resolveBlockComponent('quote', 'soft');
    expect(Soft).toBe(Default);
  });

  it('returns the same default Heading for modern style as for unknown', () => {
    const Modern = resolveBlockComponent('heading', 'modern');
    const Unknown = resolveBlockComponent('heading', 'whatever');
    expect(Modern).toBe(Unknown);
  });

  it('returns Brutalist Heading override', () => {
    const Default = resolveBlockComponent('heading', 'modern');
    const Brutalist = resolveBlockComponent('heading', 'brutalist');
    expect(Default).not.toBe(Brutalist);
  });

  it('text, list, code, chart, table, box, columns, grid have no overrides', () => {
    const types = ['text', 'list', 'code', 'chart', 'table', 'box', 'columns', 'grid'] as const;
    for (const type of types) {
      const a = resolveBlockComponent(type, 'modern');
      const b = resolveBlockComponent(type, 'brutalist');
      const c = resolveBlockComponent(type, 'editorial');
      const d = resolveBlockComponent(type, 'soft');
      expect(a).toBe(b);
      expect(a).toBe(c);
      expect(a).toBe(d);
    }
  });
});
