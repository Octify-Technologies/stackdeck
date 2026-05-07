import { NextResponse } from 'next/server';
import { readAsset } from '@/lib/decks';

/**
 * Serves static assets that live alongside filesystem-authored decks under
 * `slides/<slug>/assets/...`. Sanity decks reference Sanity-hosted CDN URLs
 * directly inside slide HTML and never hit this route.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string; path: string[] }> },
) {
  const { slug, path } = await params;
  const asset = `assets/${path.join('/')}`;
  const result = await readAsset(slug, asset);
  if (!result) {
    return new NextResponse('Not found', { status: 404 });
  }
  return new NextResponse(new Uint8Array(result.buf), {
    status: 200,
    headers: {
      'Content-Type': result.type,
      'Cache-Control': 'public, max-age=300, s-maxage=86400',
    },
  });
}
