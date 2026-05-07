import { NextResponse } from 'next/server';
import { readSlide } from '@/lib/decks';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string; file: string }> },
) {
  const { slug, file } = await params;
  const raw = await readSlide(slug, file);
  if (raw === null) {
    return new NextResponse('Not found', { status: 404 });
  }
  return new NextResponse(injectBase(raw, slug), {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=60, s-maxage=300',
      'X-Frame-Options': 'SAMEORIGIN',
    },
  });
}

/**
 * The slide is rendered inside an iframe whose URL is /c/<slug>/slides/<file>.
 * Without a <base> tag, a relative reference like `./assets/logo.png` would
 * resolve against the iframe URL and request /c/<slug>/slides/assets/logo.png,
 * which is the wrong path. Injecting <base href="/c/<slug>/"> right after the
 * opening <head> tag rewrites the resolution origin so every relative path in
 * the slide resolves against the deck root.
 *
 * Absolute URLs (e.g. https://cdn.sanity.io/...) are unaffected, so this is
 * safe for Sanity-authored slides too.
 */
function injectBase(html: string, slug: string): string {
  const baseTag = `<base href="/c/${slug}/">`;
  const headOpen = /<head\b[^>]*>/i;
  if (headOpen.test(html)) {
    return html.replace(headOpen, (match) => `${match}${baseTag}`);
  }
  // No <head> in the document. Prepend the tag so it's still effective.
  return `${baseTag}${html}`;
}
