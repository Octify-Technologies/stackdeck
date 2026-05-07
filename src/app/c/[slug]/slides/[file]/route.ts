import { NextResponse } from 'next/server';
import { readSlide } from '@/lib/case-studies';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string; file: string }> },
) {
  const { slug, file } = await params;
  const html = await readSlide(slug, file);
  if (html === null) {
    return new NextResponse('Not found', { status: 404 });
  }
  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=60, s-maxage=300',
      'X-Frame-Options': 'SAMEORIGIN',
    },
  });
}
