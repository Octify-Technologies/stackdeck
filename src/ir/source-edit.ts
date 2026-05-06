import matter from 'gray-matter';

const SLIDE_MARKER_RE = /^::slide(\{[^}]*\})?\s*$/;

/**
 * Split markdown into a frontmatter prefix and a list of marker-less slide
 * chunks. The first slide implicitly has no `::slide` marker; subsequent
 * slides start with one. We strip the marker from every chunk so reordering
 * can shuffle slides freely; `joinSlides` re-emits markers between them.
 */
function splitSourceIntoSlides(source: string): { prefix: string; slides: string[] } {
  const fm = matter(source);
  const body = fm.content;
  const lines = body.split('\n');
  const sections: string[][] = [[]];
  for (const line of lines) {
    if (SLIDE_MARKER_RE.test(line)) {
      sections.push([]);
      continue;
    }
    sections[sections.length - 1].push(line);
  }
  // If the body started with `::slide` (or only blank lines before one),
  // the leading empty section is just whitespace — drop it so we don't
  // turn it into a phantom slide.
  if (sections.length > 1 && sections[0].every((l) => l.trim() === '')) {
    sections.shift();
  }
  const slides = sections.map((chunk) => chunk.join('\n').trim());
  const fmPrefix = source.slice(0, source.length - body.length);
  return { prefix: fmPrefix, slides };
}

function joinSlides(prefix: string, slides: string[]): string {
  if (slides.length === 0) return prefix;
  const body = slides.filter((s) => s.length > 0).join('\n\n::slide\n\n');
  let out = prefix;
  if (out.length > 0 && !out.endsWith('\n')) out += '\n';
  if (out.length > 0) out += '\n';
  return out + body + '\n';
}

/**
 * Move slide at `from` to position `to`. Out-of-range indices and `from === to`
 * are no-ops. Pure: same input, same output.
 */
export function reorderSlide(source: string, from: number, to: number): string {
  if (from === to) return source;
  const { prefix, slides } = splitSourceIntoSlides(source);
  if (from < 0 || from >= slides.length) return source;
  if (to < 0 || to >= slides.length) return source;
  const next = slides.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return joinSlides(prefix, next);
}

export function countSlides(source: string): number {
  return splitSourceIntoSlides(source).slides.length;
}
