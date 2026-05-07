import 'server-only';
import { groq } from 'next-sanity';
import { sanity, CACHE_TAGS } from './sanity';

/**
 * Public types — same shape the rest of the app already consumes. The slide's
 * `file` field is now a stringified array index ("0", "1", …) rather than a
 * filesystem name, but the Viewer doesn't care because it treats it as an
 * opaque identifier when building URLs.
 */
export type SlideEntry = { file: string; title?: string };

export type CaseStudy = {
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

type SanityCaseStudyDoc = {
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

const REVALIDATE_SECONDS = 60;

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
  *[_type == "caseStudy" && (visibility == "public" || !defined(visibility))]
    | order(coalesce(date, _createdAt) desc) {
      ${META_FIELDS}
    }
`;

const ONE_QUERY = groq`
  *[_type == "caseStudy" && slug.current == $slug][0] {
    ${META_FIELDS}
  }
`;

const SLIDE_HTML_QUERY = groq`
  *[_type == "caseStudy" && slug.current == $slug][0].slides[$index].html
`;

export async function listCaseStudies(): Promise<CaseStudy[]> {
  const docs = await sanity.fetch<SanityCaseStudyDoc[]>(
    LIST_QUERY,
    {},
    { next: { tags: [CACHE_TAGS.list], revalidate: REVALIDATE_SECONDS } },
  );
  return (docs ?? []).filter((d) => d.slides && d.slides.length > 0).map(toCaseStudy);
}

export async function getCaseStudy(slug: string): Promise<CaseStudy | null> {
  if (!isSlug(slug)) return null;
  const doc = await sanity.fetch<SanityCaseStudyDoc | null>(
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
  return toCaseStudy(doc);
}

/**
 * Fetch a single slide's raw HTML body. The route at
 * `/c/[slug]/slides/[file]/route.ts` calls this and returns the response
 * with `Content-Type: text/html`. `file` is the stringified slide index.
 */
export async function readSlide(slug: string, file: string): Promise<string | null> {
  if (!isSlug(slug)) return null;
  const index = Number.parseInt(file, 10);
  if (!Number.isFinite(index) || index < 0 || index > 999) return null;

  const html = await sanity.fetch<string | null>(
    SLIDE_HTML_QUERY,
    { slug, index },
    { next: { tags: [CACHE_TAGS.one(slug)], revalidate: REVALIDATE_SECONDS } },
  );
  return typeof html === 'string' ? html : null;
}

function toCaseStudy(doc: SanityCaseStudyDoc): CaseStudy {
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

function isSlug(s: string): boolean {
  return /^[a-z0-9-]{1,64}$/.test(s);
}
