import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://stackdeck.octifytechnologies.com';
  const lastModified = new Date();

  return [
    { url: `${base}/`, lastModified, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/new`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/presets`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/templates`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
  ];
}
