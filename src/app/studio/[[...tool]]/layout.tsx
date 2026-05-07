import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'stackdeck studio',
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
