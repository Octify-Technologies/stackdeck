import type { Metadata } from 'next';

import { TemplatesGallery } from './TemplatesGallery';
import './templates.css';

export const metadata: Metadata = {
  title: 'Templates',
  description:
    'Browse curated theme combinations for stackdeck. Pitch decks, editorials, brutalist manifestos, and more.',
  alternates: { canonical: '/templates' },
};

export default function TemplatesPage() {
  return <TemplatesGallery />;
}
