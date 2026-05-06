import { describe, expect, it } from 'vitest';

import { replaceHeadingOccurrence } from '@/ir/text-edit';

describe('replaceHeadingOccurrence', () => {
  const sample = `---
title: Demo
---

# A
text

::slide

# B
text

::slide

## subsection
`;

  it('replaces the n-th h1 occurrence by index', () => {
    const out = replaceHeadingOccurrence(sample, 'h1', 1, 'B prime');
    expect(out).toContain('# B prime');
    expect(out).toContain('# A');
  });

  it('does not replace headings of a different level', () => {
    const out = replaceHeadingOccurrence(sample, 'h2', 0, 'Renamed');
    expect(out).toContain('## Renamed');
    expect(out).toContain('# A');
  });

  it('preserves frontmatter', () => {
    const out = replaceHeadingOccurrence(sample, 'h1', 0, 'Hello');
    expect(out).toMatch(/^---\ntitle: Demo\n---/);
  });

  it('skips headings inside code fences', () => {
    const src = '\n```\n# fake\n```\n\n# real\n';
    const out = replaceHeadingOccurrence(src, 'h1', 0, 'edited');
    expect(out).toContain('# fake');
    expect(out).toContain('# edited');
  });

  it('strips embedded newlines from new text', () => {
    const out = replaceHeadingOccurrence(sample, 'h1', 0, 'A\nbroken');
    expect(out).toContain('# A broken');
  });
});
