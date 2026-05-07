import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

const ROOT = path.join(process.cwd(), 'case-studies');

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

export type SlideEntry = z.infer<typeof SlideEntrySchema>;
export type CaseStudyMeta = z.infer<typeof MetaSchema>;

export type CaseStudy = CaseStudyMeta & {
  slides: SlideEntry[];
  cover: string;
};

async function readMeta(slug: string): Promise<CaseStudy | null> {
  const dir = path.join(ROOT, slug);
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
    const entries = await fs.readdir(dir);
    const htmls = entries.filter((f) => /\.html?$/.test(f) && !f.startsWith('_')).sort();
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
    ...meta,
    slides,
    cover: meta.cover ?? slides[0].file,
  };
}

export async function listCaseStudies(): Promise<CaseStudy[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(ROOT);
  } catch {
    return [];
  }
  const studies = await Promise.all(
    entries.filter((e) => !e.startsWith('.') && !e.startsWith('_')).map((slug) => readMeta(slug)),
  );
  return studies
    .filter((s): s is CaseStudy => s !== null && s.visibility !== 'private')
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
}

export async function getCaseStudy(slug: string): Promise<CaseStudy | null> {
  return readMeta(slug);
}

export async function readSlide(slug: string, file: string): Promise<string | null> {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  if (!/^[a-zA-Z0-9._-]+\.html?$/.test(file)) return null;
  const study = await getCaseStudy(slug);
  if (!study) return null;
  if (!study.slides.find((s) => s.file === file)) return null;
  try {
    return await fs.readFile(path.join(ROOT, slug, file), 'utf8');
  } catch {
    return null;
  }
}

export async function readAsset(
  slug: string,
  asset: string,
): Promise<{ buf: Buffer; type: string } | null> {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  // Only allow paths under assets/
  const normalized = path.posix.normalize(asset);
  if (normalized.startsWith('..') || normalized.startsWith('/')) return null;
  if (!normalized.startsWith('assets/')) return null;

  const full = path.join(ROOT, slug, normalized);
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
