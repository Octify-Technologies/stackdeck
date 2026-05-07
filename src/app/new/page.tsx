import type { Metadata } from 'next';

import { NewDeckGallery } from './NewDeckGallery';
import '@/app/presets/presets.css';

export const metadata: Metadata = {
  title: 'New deck, pick a preset',
  description:
    'Start a new slide deck from a curated preset. Pitch decks, editorials, brutalist manifestos, and more.',
  alternates: { canonical: '/new' },
};

export default function NewDeckPage() {
  return <NewDeckGallery />;
}
