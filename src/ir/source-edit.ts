import matter from 'gray-matter';

/**
 * Split the markdown source into slide sections without losing frontmatter.
 * Returns the frontmatter prefix plus an array of slide-section strings, each
 * including its leading `::slide` line if present.
 */
function splitSourceIntoSlides(source: string): { prefix: string; slides: string[] } {
  const fm = matter(source);
  const body = fm.content;
  const lines = body.split('\n');
  const sections: string[][] = [[]];
  for (const line of lines) {
    if (/^::slide(\{[^}]*\})?\s*$/.test(line)) {
      sections.push([line]);
      continue;
    }
    sections[sections.length - 1].push(line);
  }
  const slides = sections.map((chunk) => chunk.join('\n'));
  // The first chunk may be empty if the very first line is ::slide; that is
  // still a slide. Filter out an empty leading chunk only when there is no
  // body content at all, otherwise preserve.
  const fmPrefix = source.slice(0, source.length - body.length);
  return { prefix: fmPrefix, slides };
}

function joinSlides(prefix: string, slides: string[]): string {
  // Reassemble with the original frontmatter prefix plus the slide chunks
  // joined back with newlines. Each chunk that started with ::slide already
  // carries that marker; the very first chunk does not, so we just join.
  return prefix + slides.join('\n').replace(/\n+$/, '\n');
}

/**
 * Move slide at `from` index so it appears at `to` index. Pure: same input,
 * same output. Returns the new source string. Out-of-range indices are no-ops.
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
