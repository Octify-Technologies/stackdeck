import { type NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, verifyToken } from '@/lib/auth';

const PUBLIC_PREFIXES = ['/authenticate', '/api/revalidate'];

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  const secret = process.env.STACKDECK_AUTH_SECRET;
  if (!secret) {
    return new NextResponse('Auth misconfigured: STACKDECK_AUTH_SECRET unset', {
      status: 500,
    });
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (await verifyToken(token, secret)) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = '/authenticate';
  url.search = pathname && pathname !== '/' ? `?next=${encodeURIComponent(pathname + search)}` : '';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|icon|apple-icon|opengraph-image|twitter-image|robots\\.txt|favicon\\.ico).*)',
  ],
};
