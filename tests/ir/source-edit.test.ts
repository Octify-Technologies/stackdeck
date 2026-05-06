import { describe, expect, it } from 'vitest';

import { reorderSlide, countSlides } from '@/ir/source-edit';

describe('source-edit', () => {
  const sample = `---
title: Demo
---

# Slide A

::slide

# Slide B

::slide

# Slide C
`;

  it('counts slides correctly', () => {
    expect(countSlides(sample)).toBe(3);
  });

  it('moves the first slide to the end', () => {
    const next = reorderSlide(sample, 0, 2);
    expect(next).toContain('# Slide B');
    const idxA = next.indexOf('# Slide A');
    const idxC = next.indexOf('# Slide C');
    expect(idxC).toBeLessThan(idxA);
  });

  it('moves the last slide to the start', () => {
    const next = reorderSlide(sample, 2, 0);
    expect(next.indexOf('# Slide C')).toBeLessThan(next.indexOf('# Slide A'));
  });

  it('is a no-op when from === to', () => {
    expect(reorderSlide(sample, 1, 1)).toBe(sample);
  });

  it('is a no-op for out-of-range indices', () => {
    expect(reorderSlide(sample, 5, 0)).toBe(sample);
    expect(reorderSlide(sample, 0, -1)).toBe(sample);
  });

  it('preserves frontmatter', () => {
    const next = reorderSlide(sample, 0, 2);
    expect(next).toMatch(/^---\ntitle: Demo\n---/);
  });

  it('preserves slide count after a reorder (no merge, no phantom slide)', () => {
    const moves: [number, number][] = [
      [0, 2],
      [2, 0],
      [1, 0],
      [0, 1],
    ];
    for (const [from, to] of moves) {
      const next = reorderSlide(sample, from, to);
      expect(countSlides(next)).toBe(3);
    }
  });

  it('handles a body that starts with ::slide marker without phantom slide', () => {
    const src = '::slide\n\n# A\n\n::slide\n\n# B\n';
    expect(countSlides(src)).toBe(2);
    const next = reorderSlide(src, 0, 1);
    expect(countSlides(next)).toBe(2);
  });
});
