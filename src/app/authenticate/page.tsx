import type { Metadata } from 'next';
import { login } from './actions';
import './authenticate.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Login',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
    googleBot: { index: false, follow: false },
  },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : '/';

  return (
    <main className="login-shell">
      <form className="login-card" action={login}>
        <h1 className="login-title">stackdeck</h1>
        <p className="login-subtitle">Private. Enter password to continue.</p>
        <input type="hidden" name="next" value={safeNext} />
        <input
          name="password"
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          autoFocus
          required
          className="login-input"
        />
        <button type="submit" className="login-submit">
          Unlock
        </button>
        {error === '1' ? (
          <p className="login-error">Incorrect password.</p>
        ) : error === 'misconfig' ? (
          <p className="login-error">Auth is not configured on the server.</p>
        ) : null}
      </form>
    </main>
  );
}
