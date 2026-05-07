import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';
import { CACHE_TAGS } from '@/lib/sanity';

/**
 * Sanity webhook receiver. Configure in Sanity dashboard:
 *   - URL: https://<your-domain>/api/revalidate
 *   - Trigger: on create / update / delete of deck
 *   - HTTP method: POST
 *   - Secret: shared with SANITY_WEBHOOK_SECRET
 *   - Filter (GROQ): _type == "deck"
 *   - Projection: { "_type": _type, "slug": slug.current }
 *
 * Validates the HMAC signature, then revalidates the affected cache tags so
 * the next request fetches fresh content. The whole revalidation completes in
 * a few ms; visitor-perceived latency for the new content is one cold fetch
 * (~200–500ms) for the first request after the edit.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: 'SANITY_WEBHOOK_SECRET is not configured.' },
      { status: 500 },
    );
  }

  const { isValidSignature, body } = await parseBody<{ _type?: string; slug?: string }>(
    req,
    secret,
  );
  if (!isValidSignature) {
    return NextResponse.json({ ok: false, error: 'Invalid signature.' }, { status: 401 });
  }
  if (!body || body._type !== 'deck') {
    return NextResponse.json({ ok: false, error: 'Unsupported document type.' }, { status: 400 });
  }

  // Refresh the index list, plus the specific deck if we got a slug.
  revalidateTag(CACHE_TAGS.list);
  if (body.slug) revalidateTag(CACHE_TAGS.one(body.slug));

  return NextResponse.json({
    ok: true,
    revalidated: [CACHE_TAGS.list, body.slug ? CACHE_TAGS.one(body.slug) : null].filter(Boolean),
  });
}
