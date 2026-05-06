import type { Metadata } from 'next';

import { NewDeckGallery } from './NewDeckGallery';
import '@/app/templates/templates.css';

export const metadata: Metadata = {
  title: 'New deck, pick a template',
  description:
    'Start a new slide deck from a curated template. Pitch decks, editorials, brutalist manifestos, and more.',
  alternates: { canonical: '/new' },
};

export default function NewDeckPage() {
  return <NewDeckGallery />;
}
