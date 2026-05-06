import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { tags as t } from '@lezer/highlight';

const palette = {
  bg: 'transparent',
  fg: '#fafafa',
  fgMuted: '#8e8e8e',
  fgFaint: '#555555',
  selection: 'rgba(255, 255, 255, 0.14)',
  caret: '#ffffff',
  cursor: '#ffffff',
  punctuation: '#5a5a5a',
  string: '#c9c9c9',
  keyword: '#ffffff',
  emphasis: '#ffffff',
};

export const stackdeckTheme = EditorView.theme(
  {
    '&': {
      color: palette.fg,
      backgroundColor: palette.bg,
      fontFamily: "var(--mono), var(--font-jetbrains), ui-monospace, 'JetBrains Mono', monospace",
      fontSize: '13px',
      lineHeight: '1.75',
      height: '100%',
    },
    '.cm-scroller': {
      fontFamily: 'inherit',
      padding: '24px 28px 96px',
      overflow: 'auto',
    },
    '.cm-content': {
      caretColor: palette.caret,
      paddingBottom: '60vh',
    },
    '&.cm-focused .cm-cursor': {
      borderLeftColor: palette.cursor,
      borderLeftWidth: '2px',
    },
    '&.cm-focused .cm-selectionBackground, ::selection': {
      backgroundColor: palette.selection,
    },
    '.cm-selectionBackground': {
      backgroundColor: palette.selection,
    },
    '.cm-activeLine': {
      backgroundColor: 'rgba(255, 255, 255, 0.018)',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'transparent',
      color: palette.fgMuted,
    },
    '.cm-gutters': {
      backgroundColor: 'transparent',
      color: palette.fgFaint,
      border: 'none',
      paddingRight: '12px',
      fontSize: '11px',
      letterSpacing: '0.02em',
    },
    '.cm-lineNumbers .cm-gutterElement': {
      padding: '0 8px',
      minWidth: '28px',
      textAlign: 'right',
      fontVariantNumeric: 'tabular-nums',
    },
    '.cm-foldPlaceholder': {
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      border: 'none',
      color: palette.fgMuted,
    },
    '.cm-tooltip': {
      backgroundColor: '#111111',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      color: palette.fg,
      padding: '4px',
      boxShadow: '0 16px 40px -10px rgba(0, 0, 0, 0.8)',
    },
    '.cm-tooltip-autocomplete': {
      '& > ul > li': {
        padding: '6px 12px',
        fontFamily: "var(--ui), system-ui, sans-serif",
        fontSize: '13px',
      },
      '& > ul > li[aria-selected]': {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        color: palette.fg,
      },
    },
  },
  { dark: true },
);

export const stackdeckHighlight = HighlightStyle.define([
  { tag: t.heading1, color: palette.fg, fontWeight: '600', textDecoration: 'none' },
  { tag: t.heading2, color: palette.fg, fontWeight: '600' },
  { tag: t.heading3, color: palette.fg, fontWeight: '500' },
  { tag: t.heading4, color: palette.fg, fontWeight: '500' },
  { tag: t.heading, color: palette.fg, fontWeight: '500' },
  { tag: t.strong, color: palette.fg, fontWeight: '600' },
  { tag: t.emphasis, color: palette.emphasis, fontStyle: 'italic' },
  { tag: t.link, color: palette.fg, textDecoration: 'underline' },
  { tag: t.url, color: palette.fgMuted },
  { tag: t.quote, color: palette.fgMuted, fontStyle: 'italic' },
  { tag: t.list, color: palette.fg },
  { tag: t.monospace, color: palette.string },
  { tag: t.string, color: palette.string },
  { tag: t.meta, color: palette.fgFaint },
  { tag: t.comment, color: palette.fgFaint, fontStyle: 'italic' },
  { tag: t.keyword, color: palette.keyword, fontWeight: '500' },
  { tag: t.processingInstruction, color: palette.punctuation },
  { tag: t.contentSeparator, color: palette.fgFaint },
  { tag: t.escape, color: palette.fg },
]);

export const stackdeckSyntaxHighlighting = syntaxHighlighting(stackdeckHighlight);
