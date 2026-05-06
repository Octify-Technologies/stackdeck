import { describe, expect, it } from 'vitest';

import {
  validateBlock,
  validateDeck,
  validatePalette,
  validateStyle,
  validateSlide,
  IR_VERSION,
} from '@/ir/schema';

describe('schema validation', () => {
  describe('blocks', () => {
    it('accepts a heading block', () => {
      const r = validateBlock({ type: 'heading', level: 1, text: 'Hello' });
      expect(r.ok).toBe(true);
    });

    it('rejects a heading with level 5', () => {
      const r = validateBlock({ type: 'heading', level: 5, text: 'Hello' });
      expect(r.ok).toBe(false);
    });

    it('rejects a heading with empty text', () => {
      const r = validateBlock({ type: 'heading', level: 1, text: '' });
      expect(r.ok).toBe(false);
    });

    it('accepts a stat with a value and label', () => {
      const r = validateBlock({ type: 'stat', value: '$3M', label: 'ARR' });
      expect(r.ok).toBe(true);
    });

    it('accepts a nested box of children', () => {
      const r = validateBlock({
        type: 'box',
        tone: 'info',
        children: [
          { type: 'heading', level: 2, text: 'Title' },
          { type: 'text', text: 'Body', emphasis: 'normal' },
        ],
      });
      expect(r.ok).toBe(true);
    });

    it('rejects a box with no children', () => {
      const r = validateBlock({ type: 'box', tone: 'info', children: [] });
      expect(r.ok).toBe(false);
    });

    it('accepts a 2-column block', () => {
      const r = validateBlock({
        type: 'columns',
        count: 2,
        columns: [
          [{ type: 'text', text: 'Left', emphasis: 'normal' }],
          [{ type: 'text', text: 'Right', emphasis: 'normal' }],
        ],
      });
      expect(r.ok).toBe(true);
    });

    it('rejects a 4-column block (count must be 2 or 3)', () => {
      const r = validateBlock({
        type: 'columns',
        count: 4,
        columns: [[], [], [], []],
      });
      expect(r.ok).toBe(false);
    });
  });

  describe('palettes', () => {
    it('accepts a minimal palette with brand and accent', () => {
      const r = validatePalette({
        id: 'demo',
        name: 'Demo',
        brand: '#2563eb',
        accent: '#a855f7',
      });
      expect(r.ok).toBe(true);
    });

    it('rejects a palette with a malformed hex color', () => {
      const r = validatePalette({
        id: 'bad',
        name: 'Bad',
        brand: 'not-a-color',
        accent: '#a855f7',
      });
      expect(r.ok).toBe(false);
    });
  });

  describe('styles', () => {
    it('rejects a style missing the dark color set', () => {
      const r = validateStyle({
        id: 'broken',
        name: 'Broken',
        typography: {
          display: { family: 'Inter', weight: 700, scaleStep: 0 },
          body: { family: 'Inter', weight: 400, scaleStep: 0 },
        },
        colors: {
          light: {
            brand: '#000000',
            accent: '#000000',
            surface: '#ffffff',
            surfaceMuted: '#fafafa',
            text: '#000000',
            textMuted: '#525252',
            border: '#e5e5e5',
            success: '#16a34a',
            warn: '#d97706',
            danger: '#dc2626',
          },
        },
        radius: { sm: 4, md: 8, lg: 16 },
        shadow: { light: {}, dark: {} },
        motion: { duration: {}, easing: {} },
        spacingBase: 8,
        printSafe: true,
      });
      expect(r.ok).toBe(false);
    });
  });

  describe('decks', () => {
    it('rejects a deck with the wrong version', () => {
      const r = validateDeck({
        version: '1.0',
        id: 'd1',
        title: 'X',
        aspectRatio: '16:9',
        theme: { styleId: 'modern', paletteId: 'electric', density: 'comfortable', mode: 'light' },
        slides: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      expect(r.ok).toBe(false);
    });

    it('accepts a minimal valid deck', () => {
      const r = validateDeck({
        version: IR_VERSION,
        id: 'd1',
        title: 'X',
        aspectRatio: '16:9',
        theme: { styleId: 'modern', paletteId: 'electric', density: 'comfortable', mode: 'light' },
        slides: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      expect(r.ok).toBe(true);
    });

    it('accepts a deck with brand override', () => {
      const r = validateDeck({
        version: IR_VERSION,
        id: 'd1',
        title: 'X',
        aspectRatio: '16:9',
        theme: { styleId: 'modern', paletteId: 'electric', density: 'comfortable', mode: 'light' },
        brand: {
          name: 'Acme',
          logoUrl: 'https://cdn.example.com/logo.svg',
          logoPosition: 'top-right',
          brandColor: '#ff0066',
          accentColor: '#a855f7',
        },
        slides: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      expect(r.ok).toBe(true);
    });

    it('rejects a brand with malformed logo URL', () => {
      const r = validateDeck({
        version: IR_VERSION,
        id: 'd1',
        title: 'X',
        aspectRatio: '16:9',
        theme: { styleId: 'modern', paletteId: 'electric', density: 'comfortable', mode: 'light' },
        brand: { logoUrl: 'not a url' },
        slides: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      expect(r.ok).toBe(false);
    });

    it('rejects a brand with malformed brandColor', () => {
      const r = validateDeck({
        version: IR_VERSION,
        id: 'd1',
        title: 'X',
        aspectRatio: '16:9',
        theme: { styleId: 'modern', paletteId: 'electric', density: 'comfortable', mode: 'light' },
        brand: { brandColor: 'red' },
        slides: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      expect(r.ok).toBe(false);
    });
  });

  describe('slides', () => {
    it('accepts a slide with mixed blocks', () => {
      const r = validateSlide({
        id: 's1',
        layout: 'flow',
        blocks: [
          { type: 'heading', level: 1, text: 'Title' },
          { type: 'list', ordered: false, items: [{ text: 'one' }, { text: 'two' }] },
        ],
      });
      expect(r.ok).toBe(true);
    });
  });
});
