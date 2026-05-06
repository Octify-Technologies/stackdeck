import type { ReactNode } from 'react';

import './page.css';

export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('page-shell', className)}>{children}</div>;
}

export function PageMain({ children, className }: { children: ReactNode; className?: string }) {
  return <main className={cx('page-main', className)}>{children}</main>;
}

function cx(...parts: Array<string | null | undefined | false>): string {
  return parts.filter(Boolean).join(' ');
}
