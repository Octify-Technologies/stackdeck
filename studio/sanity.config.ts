import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemas';

const projectId =
  process.env.SANITY_STUDIO_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '';
const dataset =
  process.env.SANITY_STUDIO_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

/**
 * Standalone Sanity Studio config. Run with `pnpm studio` from the repo root.
 *
 * The studio is no longer embedded inside the Next.js app — Sanity's embedded
 * mode pulls in React 19 features (`useEffectEvent`) that don't bundle cleanly
 * through Next.js's webpack. Running standalone via the Sanity CLI sidesteps
 * the bundling and gives authors a faster, native Studio experience.
 */
export default defineConfig({
  name: 'stackdeck-studio',
  title: 'stackdeck — Octify decks',
  projectId,
  dataset,
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
});
