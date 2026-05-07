import type { Metadata, Viewport } from 'next';
import {
  DM_Sans,
  Fraunces,
  Geist,
  Inter,
  Inter_Tight,
  JetBrains_Mono,
  Manrope,
  Space_Grotesk,
} from 'next/font/google';
import './globals.css';

// User-pickable faces plus the project's mono. Every entry must have a
// matching definition in `src/themes/fonts.ts` for the font picker to
// surface it. Fraunces + Inter Tight are the Dossier preset's display+body
// pair; the others are the original sans catalog.
const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' });
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  style: ['normal', 'italic'],
  display: 'swap',
  axes: ['SOFT', 'WONK', 'opsz'],
});
const interTight = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-inter-tight',
  display: 'swap',
});
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

const SITE_URL = 'https://stackdeck.octifytechnologies.com';
const SITE_NAME = 'stackdeck';
const DEFAULT_TITLE = 'stackdeck, open-source markdown slide deck builder';
const DEFAULT_DESCRIPTION =
  'Turn a markdown file into a beautiful slide deck. Switch themes instantly. Export to PDF. No backend, no accounts, no lock-in. Open source.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: '%s · stackdeck',
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  generator: 'Next.js',
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
    'slide deck builder',
    'pitch deck maker',
    'markdown presentation tool',
  ],
  authors: [{ name: 'Octify Technologies', url: 'https://github.com/Octify-Technologies' }],
  creator: 'Octify Technologies',
  publisher: 'Octify Technologies',
  category: 'technology',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    creator: '@stackdeck',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0b0f' },
  ],
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: SITE_NAME,
  description: DEFAULT_DESCRIPTION,
  url: SITE_URL,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  author: {
    '@type': 'Organization',
    name: 'Octify Technologies',
    url: 'https://github.com/Octify-Technologies',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${inter.variable} ${spaceGrotesk.variable} ${dmSans.variable} ${manrope.variable} ${fraunces.variable} ${interTight.variable} ${jetbrains.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
