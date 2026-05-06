import type { Density, Mode } from '@/ir/schema';

import { CASE_STUDY_PRO_MARKDOWN } from './seeds/case-study-pro';
import { CASE_STUDY_EDITORIAL_MARKDOWN } from './seeds/case-study-editorial';

export type TemplateCategory = 'case-study';

export type TemplatePreset = {
  id: string;
  name: string;
  vibe: string;
  category: TemplateCategory;
  styleId: string;
  paletteId: string;
  density: Density;
  mode: Mode;
  seed: string;
  slideCount: number;
};

export const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: 'case-study-pro',
    name: 'Case Study Pro',
    vibe: 'Sales-call optimized. Punchy, stat-forward, built to close',
    category: 'case-study',
    styleId: 'modern',
    paletteId: 'electric',
    density: 'comfortable',
    mode: 'light',
    seed: CASE_STUDY_PRO_MARKDOWN,
    slideCount: 14,
  },
  {
    id: 'case-study-editorial',
    name: 'Case Study Editorial',
    vibe: 'Sendable PDF. Magazine-grade narrative, calm and considered',
    category: 'case-study',
    styleId: 'editorial',
    paletteId: 'mono',
    density: 'airy',
    mode: 'light',
    seed: CASE_STUDY_EDITORIAL_MARKDOWN,
    slideCount: 14,
  },
];
