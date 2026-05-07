import type { MetadataRoute } from 'next';
import { listDecks } from '@/lib/decks';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://stackdeck.octifytechnologies.com';
  const lastModified = new Date();
  const decks = await listDecks();
  return [
    { url: `${base}/`, lastModified, changeFrequency: 'weekly', priority: 1.0 },
    ...decks.map((d) => ({
      url: `${base}/c/${d.slug}`,
      lastModified: d.date ? new Date(d.date) : lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
