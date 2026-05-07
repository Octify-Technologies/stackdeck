import type { MetadataRoute } from 'next';
import { listCaseStudies } from '@/lib/case-studies';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://stackdeck.octifytechnologies.com';
  const lastModified = new Date();
  const studies = await listCaseStudies();
  return [
    { url: `${base}/`, lastModified, changeFrequency: 'weekly', priority: 1.0 },
    ...studies.map((s) => ({
      url: `${base}/c/${s.slug}`,
      lastModified: s.date ? new Date(s.date) : lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
