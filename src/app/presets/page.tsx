import type { Metadata } from 'next';

import { PresetsGallery } from './PresetsGallery';
import './presets.css';

export const metadata: Metadata = {
  title: 'Presets',
  description:
    'Visual designs for your slide decks. Each preset is a typography and color system you can pair with any template.',
  alternates: { canonical: '/presets' },
};

export default function PresetsPage() {
  return <PresetsGallery />;
}
