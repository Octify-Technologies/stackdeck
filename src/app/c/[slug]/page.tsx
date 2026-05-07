import { notFound } from 'next/navigation';
import { getDeck, listDecks } from '@/lib/decks';
import { Viewer } from '@/components/Viewer';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  const decks = await listDecks();
  return decks.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const deck = await getDeck(slug);
  if (!deck) return {};
  const titleSuffix = deck.client ? `${deck.client} · Octify Deck` : 'Octify Deck';
  const description = deck.summary ?? `Octify deck${deck.client ? ` for ${deck.client}` : ''}.`;
  return {
    title: `${deck.title} · ${titleSuffix}`,
    description,
    openGraph: {
      title: `${deck.title}${deck.client ? ` — ${deck.client}` : ''}`,
      description,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: deck.title,
      description,
    },
  };
}

export default async function DeckPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const deck = await getDeck(slug);
  if (!deck) notFound();

  return <Viewer slug={deck.slug} title={deck.title} client={deck.client} slides={deck.slides} />;
}
