import { NextResponse } from 'next/server';
import { readAsset } from '@/lib/case-studies';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string; path: string[] }> },
) {
  const { slug, path: parts } = await params;
  const asset = `assets/${parts.join('/')}`;
  const result = await readAsset(slug, asset);
  if (!result) {
    return new NextResponse('Not found', { status: 404 });
  }
  return new NextResponse(new Uint8Array(result.buf), {
    status: 200,
    headers: {
      'Content-Type': result.type,
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
