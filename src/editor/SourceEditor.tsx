'use client';

import { autocompletion, closeBrackets, completionKeymap } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { bracketMatching, foldGutter, indentOnInput } from '@codemirror/language';
import { searchKeymap } from '@codemirror/search';
import { EditorState } from '@codemirror/state';
import {
  EditorView,
  drawSelection,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
} from '@codemirror/view';
import { useEffect, useRef } from 'react';

import { directiveHighlight } from './cm-directive-highlight';
import { slashCommandSource } from './cm-slash-command';
import { stackdeckSyntaxHighlighting, stackdeckTheme } from './cm-theme';

type Props = {
  value: string;
  onChange: (value: string) => void;
  onReady?: (insert: (snippet: string) => void) => void;
};

/**
 * CodeMirror 6 editor wired up with markdown language support, custom directive
 * syntax highlighting, line numbers, history, fold gutter. The parent gets a
 * callback to insert text at the cursor (used by the Insert menu).
 */
export function SourceEditor({ value, onChange, onReady }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onChangeRef.current = onChange;
    onReadyRef.current = onReady;
  });

  useEffect(() => {
    if (!hostRef.current) return;

    const view = new EditorView({
      parent: hostRef.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          stackdeckTheme,
          stackdeckSyntaxHighlighting,
          markdown(),
          directiveHighlight,
          lineNumbers(),
          highlightActiveLine(),
          highlightActiveLineGutter(),
          foldGutter({
            markerDOM: (open) => {
              const span = document.createElement('span');
              span.textContent = open ? '▾' : '▸';
              span.className = 'cm-fold-marker';
              return span;
            },
          }),
          drawSelection(),
          history(),
          bracketMatching(),
          closeBrackets(),
          indentOnInput(),
          autocompletion({
            override: [slashCommandSource],
            activateOnTyping: true,
            icons: false,
            defaultKeymap: true,
          }),
          EditorView.lineWrapping,
          keymap.of([
            ...defaultKeymap,
            ...historyKeymap,
            ...searchKeymap,
            ...completionKeymap,
            indentWithTab,
          ]),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChangeRef.current(update.state.doc.toString());
            }
          }),
        ],
      }),
    });

    viewRef.current = view;

    onReadyRef.current?.((snippet: string) => {
      const v = viewRef.current;
      if (!v) return;
      const pos = v.state.selection.main.head;
      v.dispatch({
        changes: { from: pos, insert: snippet },
        selection: { anchor: pos + snippet.length },
      });
      v.focus();
    });

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // External `value` updates (e.g., load from IndexedDB). Only swap when truly
  // different to avoid clobbering the user's caret on every render.
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current === value) return;
    view.dispatch({
      changes: { from: 0, to: current.length, insert: value },
    });
  }, [value]);

  return <div ref={hostRef} className="cm-host" />;
}
