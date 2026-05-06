import type { Metadata } from 'next';
import { Inter, Geist, Fraunces, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap' });
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://stackdeck.dev'),
  title: {
    default: 'stackdeck — open-source markdown slide deck builder',
    template: '%s · stackdeck',
  },
  description:
    'Turn a markdown file into a beautiful slide deck. Switch themes instantly. Export to PDF. No backend, no accounts, no lock-in. Open source.',
  keywords: [
    'markdown slides',
    'markdown to pdf',
    'presentation tool',
    'slide deck',
    'open source slides',
    'markdown presentation',
    'slide generator',
    'themed slides',
    'static slide deck',
  ],
  openGraph: {
    title: 'stackdeck — open-source markdown slide deck builder',
    description:
      'Turn a markdown file into a beautiful slide deck. Switch themes instantly. Export to PDF.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'stackdeck — open-source markdown slide deck builder',
    description:
      'Turn a markdown file into a beautiful slide deck. Switch themes instantly. Export to PDF.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geist.variable} ${fraunces.variable} ${spaceGrotesk.variable} ${jetbrains.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
