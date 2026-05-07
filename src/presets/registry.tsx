import type { ReactNode } from 'react';

import type { Deck, Slide } from '@/ir/schema';

import { composeDossierSlide } from './dossier/compose';

export type SlideContext = {
  deck: Deck;
  index: number;
  total: number;
  section?: string;
};

type SlideComposer = (slide: Slide, ctx: SlideContext) => ReactNode | null;

const composers: Record<string, SlideComposer> = {
  dossier: composeDossierSlide,
};

export function getPresetComposer(presetId: string | undefined): SlideComposer | undefined {
  if (!presetId) return undefined;
  return composers[presetId];
}
