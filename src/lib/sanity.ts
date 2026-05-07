import 'server-only';
import { createClient, type SanityClient } from '@sanity/client';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() || '';
const dataset = (process.env.NEXT_PUBLIC_SANITY_DATASET || 'production').trim();
const apiVersion = (process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01').trim();
const readToken = process.env.SANITY_READ_TOKEN; // optional, only needed for drafts

/**
 * True when Sanity env vars are configured. When false, callers should fall
 * through to the filesystem-backed loader so the app works without a CMS.
 */
export const sanityEnabled = projectId.length > 0;

/**
 * Server-side Sanity client. `null` when env vars aren't set, so the app
 * still boots and the filesystem loader serves decks. CDN reads are public
 * and fast; per-request latency is mitigated by Next.js fetch cache + tag-
 * based revalidation in the queries.
 */
export const sanity: SanityClient | null = sanityEnabled
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: !readToken,
      token: readToken,
      perspective: readToken ? 'previewDrafts' : 'published',
    })
  : null;

/**
 * Cache-tag identifiers used both at fetch time (next.tags) and from the
 * webhook handler when content changes in Sanity.
 */
export const CACHE_TAGS = {
  list: 'decks',
  one: (slug: string) => `deck:${slug}`,
} as const;
