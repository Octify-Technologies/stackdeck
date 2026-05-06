import type { ReactNode } from 'react';

import './page.css';

export function GalleryGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('gallery-grid', className)}>{children}</div>;
}

function cx(...parts: Array<string | null | undefined | false>): string {
  return parts.filter(Boolean).join(' ');
}
