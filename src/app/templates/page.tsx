import type { Metadata } from 'next';

import { TemplatesGallery } from './TemplatesGallery';
import '../presets/presets.css';

export const metadata: Metadata = {
  title: 'Templates',
  description:
    'Content scaffolds for case studies, pitches, and sales decks. Pick a template and pair it with a preset design.',
  alternates: { canonical: '/templates' },
};

export default function TemplatesPage() {
  return <TemplatesGallery />;
}
