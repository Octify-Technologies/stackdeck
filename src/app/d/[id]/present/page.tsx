import type { Metadata } from 'next';

import { PresentMode } from '@/present/PresentMode';
import '@/present/present.css';

export const metadata: Metadata = {
  title: 'Present',
};

type Params = Promise<{ id: string }>;

export default async function PresentDeckPage({ params }: { params: Params }) {
  const { id } = await params;
  return <PresentMode deckId={id} />;
}
