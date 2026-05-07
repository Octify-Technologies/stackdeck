import 'server-only';
import { createClient } from '@sanity/client';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01';
const readToken = process.env.SANITY_READ_TOKEN; // optional, only needed for drafts

if (!projectId) {
  // Surface this at startup, not at first request.
  throw new Error(
    'NEXT_PUBLIC_SANITY_PROJECT_ID is not set. Add it to .env.local (and your Vercel project).',
  );
}

/**
 * Server-side Sanity client. CDN reads are public and fast; perViewLatency is
 * mitigated by Next.js fetch cache + tag-based revalidation in the queries
 * below.
 */
export const sanity = createClient({
  projectId,
  dataset,
  apiVersion,
  // Use the CDN for published content; the read token (if set) lets us bypass
  // it when previewing drafts.
  useCdn: !readToken,
  token: readToken,
  perspective: readToken ? 'previewDrafts' : 'published',
});

/**
 * Cache-tag identifiers used both at fetch time (next.tags) and from the
 * webhook handler when content changes in Sanity.
 */
export const CACHE_TAGS = {
  list: 'caseStudies',
  one: (slug: string) => `caseStudy:${slug}`,
} as const;
