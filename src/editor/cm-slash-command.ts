import type { CompletionContext, CompletionResult } from '@codemirror/autocomplete';

import { INSERT_ITEMS } from './insert-items';

/**
 * Slash command source for CodeMirror autocomplete. Activates when the user
 * types `/` followed by optional word characters at the start of a line.
 * Replaces the slash + filter text with the chosen snippet.
 */
export function slashCommandSource(ctx: CompletionContext): CompletionResult | null {
  const word = ctx.matchBefore(/\/[\w-]*/);
  if (!word) return null;

  const lineStart = ctx.state.doc.lineAt(word.from).from;
  const before = ctx.state.sliceDoc(lineStart, word.from);
  if (before.trim().length > 0) return null;

  if (word.from === word.to && !ctx.explicit) return null;

  return {
    from: word.from,
    to: word.to,
    filter: true,
    options: INSERT_ITEMS.map((item) => ({
      label: `/${item.label.toLowerCase().replace(/\s+/g, '-')}`,
      displayLabel: item.label,
      detail: item.description,
      type: 'keyword',
      apply: item.snippet.replace(/^\n+/, ''),
      boost: -INSERT_ITEMS.indexOf(item),
    })),
  };
}
