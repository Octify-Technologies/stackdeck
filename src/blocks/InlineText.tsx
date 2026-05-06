import { marked } from 'marked';

/**
 * Renders a string of inline markdown (bold, italic, code, links) as HTML.
 * Inputs come from authored markdown, so we trust the parser's output.
 */
export function InlineText({ text }: { text: string }) {
  const html = marked.parseInline(text, { async: false }) as string;
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
