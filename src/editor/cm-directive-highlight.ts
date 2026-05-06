import {
  Decoration,
  type DecorationSet,
  type EditorView,
  type PluginValue,
  ViewPlugin,
  type ViewUpdate,
} from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';

const directiveLineMark = Decoration.line({ class: 'cm-stackdeck-directive' });
const directiveOpenMark = Decoration.mark({ class: 'cm-stackdeck-directive-name' });
const directiveOptionsMark = Decoration.mark({ class: 'cm-stackdeck-directive-options' });
const directiveCloseMark = Decoration.line({ class: 'cm-stackdeck-directive-close' });
const columnSepMark = Decoration.line({ class: 'cm-stackdeck-colsep' });
const slideSepMark = Decoration.line({ class: 'cm-stackdeck-slide-sep' });

const DIRECTIVE_OPEN_RE = /^(::)([a-zA-Z][a-zA-Z0-9.]*)(\{[^}]*\})?\s*$/;
const DIRECTIVE_CLOSE_RE = /^::\s*$/;
const COLUMN_SEP_RE = /^:::\s*$/;

function buildDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  for (const { from, to } of view.visibleRanges) {
    let pos = from;
    while (pos <= to) {
      const line = view.state.doc.lineAt(pos);
      const text = line.text;

      if (DIRECTIVE_CLOSE_RE.test(text)) {
        builder.add(line.from, line.from, directiveCloseMark);
      } else if (COLUMN_SEP_RE.test(text)) {
        builder.add(line.from, line.from, columnSepMark);
      } else {
        const m = DIRECTIVE_OPEN_RE.exec(text);
        if (m) {
          if (m[2] === 'slide') {
            builder.add(line.from, line.from, slideSepMark);
          } else {
            builder.add(line.from, line.from, directiveLineMark);
          }
          const colonsStart = line.from;
          const nameStart = colonsStart + m[1].length;
          const nameEnd = nameStart + m[2].length;
          builder.add(colonsStart, nameEnd, directiveOpenMark);
          if (m[3]) {
            const optsStart = nameEnd;
            const optsEnd = optsStart + m[3].length;
            builder.add(optsStart, optsEnd, directiveOptionsMark);
          }
        }
      }

      pos = line.to + 1;
      if (line.to === view.state.doc.length) break;
    }
  }
  return builder.finish();
}

export const directiveHighlight = ViewPlugin.fromClass(
  class implements PluginValue {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = buildDecorations(view);
    }
    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = buildDecorations(update.view);
      }
    }
  },
  { decorations: (v) => v.decorations },
);
