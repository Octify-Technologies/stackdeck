import matter from 'gray-matter';

const HEADING_RE = /^(#{1,4})\s+(.+?)\s*$/;

export type EditableKind = 'h1' | 'h2' | 'h3' | 'h4';

function levelOf(kind: EditableKind): number {
  return Number(kind.slice(1));
}

/**
 * Replace the n-th occurrence (0-indexed) of a heading at the given level in
 * `source` with `nextText`. Frontmatter and code fences are skipped. Pure
 * function: same input, same output.
 */
export function replaceHeadingOccurrence(
  source: string,
  kind: EditableKind,
  index: number,
  nextText: string,
): string {
  const fm = matter(source);
  const prefix = source.slice(0, source.length - fm.content.length);
  const lines = fm.content.split('\n');
  const target = levelOf(kind);
  let inFence = false;
  let occurrence = 0;
  const out: string[] = [];
  for (const line of lines) {
    const fence = /^\s*```/.test(line);
    if (fence) {
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (inFence) {
      out.push(line);
      continue;
    }
    const m = HEADING_RE.exec(line);
    if (m && m[1].length === target) {
      if (occurrence === index) {
        const safe = nextText.replace(/\r?\n+/g, ' ').trim();
        out.push(`${m[1]} ${safe}`);
        occurrence++;
        continue;
      }
      occurrence++;
    }
    out.push(line);
  }
  return prefix + out.join('\n');
}
