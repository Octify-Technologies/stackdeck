import Link from 'next/link';
import type { ReactNode } from 'react';

import './page.css';

export function BackLink({
  href,
  children,
  ariaLabel,
}: {
  href: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  return (
    <Link href={href} className="back-link" aria-label={ariaLabel}>
      <span className="back-link__arrow" aria-hidden>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M9 11L5 7L9 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {children}
    </Link>
  );
}
