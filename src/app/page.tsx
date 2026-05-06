import type { Metadata } from 'next';

import { DeckLibrary } from '@/library/DeckLibrary';
import '@/library/library.css';

export const metadata: Metadata = {
  title: 'Your decks',
};

export default function HomePage() {
  return <DeckLibrary />;
}
