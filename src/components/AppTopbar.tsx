'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import './AppTopbar.css';

const NAV_ITEMS: ReadonlyArray<{ href: string; label: string; match: (p: string) => boolean }> = [
  { href: '/', label: 'Library', match: (p) => p === '/' },
  { href: '/templates', label: 'Templates', match: (p) => p.startsWith('/templates') },
];

export function AppTopbar() {
  const pathname = usePathname() ?? '/';

  return (
    <header className="app-topbar">
      <div className="app-topbar__inner">
        <Link href="/" className="app-topbar__brand" aria-label="stackdeck home">
          <span className="app-topbar__brand-mark" aria-hidden>
            <svg width="36" height="36" viewBox="0 0 22 22" fill="none">
              <rect x="1.8" y="6.9" width="12" height="12" rx="2" fill="#6366f1" />
              <rect x="5" y="5" width="12" height="12" rx="2" fill="#ec4899" />
              <rect x="8.2" y="3.1" width="12" height="12" rx="2" fill="#f59e0b" />
            </svg>
          </span>
          <span className="app-topbar__brand-name">stackdeck</span>
        </Link>
        <nav className="app-topbar__actions" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="app-topbar__link"
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
          <a
            href="https://github.com/Octify-Technologies/stackdeck"
            target="_blank"
            rel="noopener noreferrer"
            className="app-topbar__link"
          >
            GitHub
          </a>
          <Link href="/new" className="app-topbar__cta">
            New deck
          </Link>
        </nav>
      </div>
    </header>
  );
}
