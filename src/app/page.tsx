import type { Metadata } from 'next';

import { DeckLibrary } from '@/library/DeckLibrary';
import '@/library/library.css';

export const metadata: Metadata = {
  title: 'Your decks',
  description:
    'Your library of markdown slide decks. Create, edit, and export beautiful presentations with stackdeck.',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return <DeckLibrary />;
}
