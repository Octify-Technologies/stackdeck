import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { tags as t } from '@lezer/highlight';

/**
 * CodeMirror theme. All colors come from CSS variables declared on
 * `.editor__source-pane` in editor.css, so the JS theme and the directive
 * line classes share one palette. Change colors there.
 */
export const stackdeckTheme = EditorView.theme(
  {
    '&': {
      color: 'var(--syn-fg)',
      backgroundColor: 'transparent',
      fontFamily: "var(--mono), var(--font-jetbrains), ui-monospace, 'JetBrains Mono', monospace",
      fontSize: '14px',
      lineHeight: '1.75',
      height: '100%',
    },
    '.cm-scroller': {
      fontFamily: 'inherit',
      padding: '24px 28px 96px',
      overflow: 'auto',
    },
    '.cm-content': {
      caretColor: 'var(--syn-caret)',
      paddingBottom: '60vh',
    },
    '&.cm-focused .cm-cursor': {
      borderLeftColor: 'var(--syn-caret)',
      borderLeftWidth: '2px',
    },
    '&.cm-focused .cm-selectionBackground, ::selection': {
      backgroundColor: 'var(--syn-selection)',
    },
    '.cm-selectionBackground': {
      backgroundColor: 'var(--syn-selection)',
    },
    '.cm-activeLine': {
      backgroundColor: 'var(--syn-active-line)',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'transparent',
      color: 'var(--syn-muted)',
    },
    '.cm-gutters': {
      backgroundColor: 'transparent',
      color: 'var(--syn-faint)',
      borderRight: '1px solid rgba(255, 255, 255, 0.04)',
      paddingRight: '14px',
      fontSize: '12px',
      letterSpacing: '0.02em',
    },
    '.cm-lineNumbers .cm-gutterElement': {
      padding: '0 8px',
      minWidth: '32px',
      textAlign: 'right',
      fontVariantNumeric: 'tabular-nums',
    },
    '.cm-foldPlaceholder': {
      backgroundColor: 'rgba(245, 185, 122, 0.1)',
      border: '1px solid rgba(245, 185, 122, 0.3)',
      borderRadius: '4px',
      color: 'var(--syn-amber-soft)',
      padding: '0 6px',
      margin: '0 2px',
    },
    /* Tooltip + autocomplete styling lives in editor.css (.cm-tooltip-autocomplete)
       so all surface tokens stay in CSS. The JS theme just sets the chrome. */
  },
  { dark: true },
);

/**
 * Markdown syntax colors. Editorial palette: warm amber for headings and
 * structural markers, sky blue for directives/links, sage for quotes,
 * cream for code and emphasis. Restraint over rainbow.
 */
const stackdeckHighlight = HighlightStyle.define([
  // Headings: warm amber hashes, bright fg text, weight increases by level
  { tag: t.heading1, color: 'var(--syn-fg-bright)', fontWeight: '600' },
  { tag: t.heading2, color: 'var(--syn-fg-bright)', fontWeight: '600' },
  { tag: t.heading3, color: 'var(--syn-fg-bright)', fontWeight: '500' },
  { tag: t.heading4, color: 'var(--syn-fg-bright)', fontWeight: '500' },
  { tag: t.heading, color: 'var(--syn-fg-bright)', fontWeight: '500' },

  // Inline emphasis
  { tag: t.strong, color: 'var(--syn-fg-bright)', fontWeight: '700' },
  { tag: t.emphasis, color: 'var(--syn-fg)', fontStyle: 'italic' },
  { tag: t.strikethrough, color: 'var(--syn-faint)', textDecoration: 'line-through' },

  // Links
  { tag: t.link, color: 'var(--syn-teal)', textDecoration: 'underline' },
  { tag: t.url, color: 'var(--syn-teal-soft)' },

  // Block content
  { tag: t.quote, color: 'var(--syn-sage)', fontStyle: 'italic' },
  { tag: t.list, color: 'var(--syn-fg)' },

  // Code
  { tag: t.monospace, color: 'var(--syn-cream)' },
  { tag: t.string, color: 'var(--syn-cream)' },

  // Markdown syntax punctuation (#, *, -, >, etc.)
  { tag: t.processingInstruction, color: 'var(--syn-amber)' },
  { tag: t.contentSeparator, color: 'var(--syn-amber-soft)', fontWeight: '500' },
  { tag: t.escape, color: 'var(--syn-fg)' },

  // Frontmatter / metadata
  { tag: t.meta, color: 'var(--syn-faint)' },
  { tag: t.comment, color: 'var(--syn-faint)', fontStyle: 'italic' },
  { tag: t.keyword, color: 'var(--syn-violet)', fontWeight: '500' },
]);

export const stackdeckSyntaxHighlighting = syntaxHighlighting(stackdeckHighlight);
