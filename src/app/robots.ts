import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: 'https://stackdeck.octifytechnologies.com/sitemap.xml',
    host: 'https://stackdeck.octifytechnologies.com',
  };
}
