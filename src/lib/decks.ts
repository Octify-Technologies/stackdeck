import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { groq } from 'next-sanity';
import { z } from 'zod';
import { sanity, sanityEnabled, CACHE_TAGS } from './sanity';

/**
 * The loader is hybrid by design. Sanity is the recommended authoring source
 * but optional. When Sanity env vars aren't set, or when a Sanity request
 * fails, we fall through to the local `slides/<slug>/` filesystem format so
 * the app keeps working with hand-dropped decks.
 *
 * Slide identifiers differ between sources:
 *   - Sanity decks expose `file` as a stringified array index ("0", "1", ...)
 *   - Filesystem decks expose `file` as the on-disk name ("01.html", ...)
 * The viewer treats `file` as opaque, so callers don't care; only readSlide
 * has to parse it back into a source-specific lookup.
 */

export type SlideEntry = { file: string; title?: string };

export type Deck = {
  slug: string;
  title: string;
  client?: string;
  industry?: string;
  date?: string;
  cover: string;
  tags?: string[];
  summary?: string;
  visibility?: 'public' | 'private';
  slides: SlideEntry[];
};

const REVALIDATE_SECONDS = 60;
const FS_ROOT = path.join(process.cwd(), 'slides');

// ─── Public API ────────────────────────────────────────────────────────────

export async function listDecks(): Promise<Deck[]> {
  const [fromSanity, fromDisk] = await Promise.all([listFromSanity(), listFromDisk()]);
  // De-duplicate by slug; Sanity wins on collision so editing in the CMS
  // overrides any stale on-disk copy.
  const seen = new Set<string>();
  const merged: Deck[] = [];
  for (const d of [...fromSanity, ...fromDisk]) {
    if (seen.has(d.slug)) continue;
    seen.add(d.slug);
    merged.push(d);
  }
  return merged.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
}

export async function getDeck(slug: string): Promise<Deck | null> {
  if (!isSlug(slug)) return null;
  const sanityDoc = await getFromSanity(slug);
  if (sanityDoc) return sanityDoc;
  return getFromDisk(slug);
}

export async function readSlide(slug: string, file: string): Promise<string | null> {
  if (!isSlug(slug)) return null;
  // Sanity uses "0", "1", ... as the file id. Filesystem uses "*.html".
  if (/^\d+$/.test(file)) {
    const html = await readSlideFromSanity(slug, Number.parseInt(file, 10));
    if (html != null) return html;
  }
  if (/^[a-zA-Z0-9._-]+\.html?$/.test(file)) {
    return readSlideFromDisk(slug, file);
  }
  return null;
}

export async function readAsset(
  slug: string,
  asset: string,
): Promise<{ buf: Buffer; type: string } | null> {
  // Assets only exist for filesystem decks. Sanity decks reference Sanity
  // CDN URLs directly inside slide HTML.
  if (!isSlug(slug)) return null;
  const normalized = path.posix.normalize(asset);
  if (normalized.startsWith('..') || normalized.startsWith('/')) return null;
  if (!normalized.startsWith('assets/')) return null;

  const full = path.join(FS_ROOT, slug, normalized);
  try {
    const buf = await fs.readFile(full);
    const ext = path.extname(full).toLowerCase();
    const type =
      {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.avif': 'image/avif',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.css': 'text/css; charset=utf-8',
        '.js': 'text/javascript; charset=utf-8',
      }[ext] ?? 'application/octet-stream';
    return { buf, type };
  } catch {
    return null;
  }
}

// ─── Sanity source ─────────────────────────────────────────────────────────

type SanityDeckDoc = {
  slug: string;
  title: string;
  client?: string;
  industry?: string;
  date?: string;
  tags?: string[];
  summary?: string;
  visibility?: 'public' | 'private';
  coverIndex?: number;
  slides?: { _key?: string; title?: string }[];
};

const META_FIELDS = `
  "slug": slug.current,
  title,
  client,
  industry,
  "date": date,
  tags,
  summary,
  visibility,
  coverIndex,
  "slides": slides[]{ _key, title }
`;

const LIST_QUERY = groq`
  *[_type == "deck" && (visibility == "public" || !defined(visibility))]
    | order(coalesce(date, _createdAt) desc) {
      ${META_FIELDS}
    }
`;

const ONE_QUERY = groq`
  *[_type == "deck" && slug.current == $slug][0] {
    ${META_FIELDS}
  }
`;

const SLIDE_HTML_QUERY = groq`
  *[_type == "deck" && slug.current == $slug][0].slides[$index].html
`;

async function listFromSanity(): Promise<Deck[]> {
  if (!sanityEnabled || !sanity) return [];
  try {
    const docs = await sanity.fetch<SanityDeckDoc[]>(
      LIST_QUERY,
      {},
      { next: { tags: [CACHE_TAGS.list], revalidate: REVALIDATE_SECONDS } },
    );
    return (docs ?? []).filter((d) => d.slides && d.slides.length > 0).map(sanityToDeck);
  } catch (err) {
    console.warn('[decks] Sanity list failed; using filesystem only.', err);
    return [];
  }
}

async function getFromSanity(slug: string): Promise<Deck | null> {
  if (!sanityEnabled || !sanity) return null;
  try {
    const doc = await sanity.fetch<SanityDeckDoc | null>(
      ONE_QUERY,
      { slug },
      {
        next: {
          tags: [CACHE_TAGS.one(slug), CACHE_TAGS.list],
          revalidate: REVALIDATE_SECONDS,
        },
      },
    );
    if (!doc || !doc.slides || doc.slides.length === 0) return null;
    return sanityToDeck(doc);
  } catch (err) {
    console.warn(`[decks] Sanity get(${slug}) failed; trying filesystem.`, err);
    return null;
  }
}

async function readSlideFromSanity(slug: string, index: number): Promise<string | null> {
  if (!sanityEnabled || !sanity) return null;
  if (!Number.isFinite(index) || index < 0 || index > 999) return null;
  try {
    const html = await sanity.fetch<string | null>(
      SLIDE_HTML_QUERY,
      { slug, index },
      { next: { tags: [CACHE_TAGS.one(slug)], revalidate: REVALIDATE_SECONDS } },
    );
    return typeof html === 'string' ? html : null;
  } catch (err) {
    console.warn(`[decks] Sanity slide(${slug}, ${index}) failed.`, err);
    return null;
  }
}

function sanityToDeck(doc: SanityDeckDoc): Deck {
  const slides: SlideEntry[] = (doc.slides ?? []).map((s, i) => ({
    file: String(i),
    title: s.title?.trim() || undefined,
  }));
  const requested = typeof doc.coverIndex === 'number' ? doc.coverIndex : 0;
  const coverIndex = Math.max(0, Math.min(requested, slides.length - 1));
  return {
    slug: doc.slug,
    title: doc.title,
    client: doc.client,
    industry: doc.industry,
    date: doc.date,
    tags: doc.tags,
    summary: doc.summary,
    visibility: doc.visibility,
    slides,
    cover: String(coverIndex),
  };
}

// ─── Filesystem source ─────────────────────────────────────────────────────

const SlideEntrySchema = z.object({
  file: z.string().regex(/^[a-zA-Z0-9._-]+\.html?$/),
  title: z.string().optional(),
});

const MetaSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string(),
  client: z.string().optional(),
  industry: z.string().optional(),
  date: z.string().optional(),
  cover: z.string().optional(),
  tags: z.array(z.string()).optional(),
  slides: z.array(SlideEntrySchema).optional(),
  visibility: z.enum(['public', 'private']).optional(),
  summary: z.string().optional(),
});

async function listFromDisk(): Promise<Deck[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(FS_ROOT);
  } catch {
    return [];
  }
  const studies = await Promise.all(
    entries
      .filter((e) => !e.startsWith('.') && !e.startsWith('_'))
      .map((slug) => getFromDisk(slug)),
  );
  return studies.filter((s): s is Deck => s !== null && s.visibility !== 'private');
}

async function getFromDisk(slug: string): Promise<Deck | null> {
  if (!isSlug(slug)) return null;
  const dir = path.join(FS_ROOT, slug);
  let stat;
  try {
    stat = await fs.stat(dir);
  } catch {
    return null;
  }
  if (!stat.isDirectory()) return null;

  const metaPath = path.join(dir, 'meta.json');
  let raw: string;
  try {
    raw = await fs.readFile(metaPath, 'utf8');
  } catch {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  const result = MetaSchema.safeParse(parsed);
  if (!result.success) return null;
  const meta = result.data;
  if (meta.slug !== slug) return null;

  let slides = meta.slides;
  if (!slides || slides.length === 0) {
    const dirEntries = await fs.readdir(dir);
    const htmls = dirEntries.filter((f) => /\.html?$/.test(f) && !f.startsWith('_')).sort();
    slides = await Promise.all(
      htmls.map(async (file) => {
        const content = await fs.readFile(path.join(dir, file), 'utf8');
        const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
        return { file, title: titleMatch?.[1]?.trim() };
      }),
    );
  }
  if (slides.length === 0) return null;

  return {
    slug: meta.slug,
    title: meta.title,
    client: meta.client,
    industry: meta.industry,
    date: meta.date,
    tags: meta.tags,
    summary: meta.summary,
    visibility: meta.visibility,
    slides,
    cover: meta.cover ?? slides[0].file,
  };
}

async function readSlideFromDisk(slug: string, file: string): Promise<string | null> {
  const study = await getFromDisk(slug);
  if (!study) return null;
  if (!study.slides.find((s) => s.file === file)) return null;
  try {
    return await fs.readFile(path.join(FS_ROOT, slug, file), 'utf8');
  } catch {
    return null;
  }
}

function isSlug(s: string): boolean {
  return /^[a-z0-9-]{1,64}$/.test(s);
}
