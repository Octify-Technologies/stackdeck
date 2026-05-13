'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE_NAME, SESSION_DAYS, signToken } from '@/lib/auth';

export async function login(formData: FormData) {
  const password = String(formData.get('password') ?? '');
  const nextRaw = String(formData.get('next') ?? '/');
  const next = nextRaw.startsWith('/') && !nextRaw.startsWith('//') ? nextRaw : '/';

  const expected = process.env.STACKDECK_PASSWORD;
  const secret = process.env.STACKDECK_AUTH_SECRET;

  if (!expected || !secret) {
    redirect('/authenticate?error=misconfig');
  }

  if (password !== expected) {
    redirect(`/authenticate?error=1&next=${encodeURIComponent(next)}`);
  }

  const exp = Math.floor(Date.now() / 1000) + SESSION_DAYS * 24 * 60 * 60;
  const token = await signToken(exp, secret);

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(exp * 1000),
  });

  redirect(next);
}
