/**
 * Mounts the Sanity Studio at /studio. Authors edit decks here; nothing on
 * this route is indexed (see noIndex in metadata) and visiting it does not
 * affect the rest of the app.
 */
'use client';

import { NextStudio } from 'next-sanity/studio';
import config from '../../../../studio/sanity.config';

export const dynamic = 'force-static';

export default function StudioPage() {
  return <NextStudio config={config} />;
}
