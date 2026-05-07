import type { Columns, Slide, Text } from '@/ir/schema';

import { Monogram } from '../atoms/Monogram';
import { findFirst } from '../extract';

type Props = {
  slide: Slide;
  client?: string;
  date?: string;
  dossier?: string;
};

type Field = { label: string; value: string };

function detectField(text: string): Field {
  if (/@/.test(text)) return { label: 'Email', value: text };
  if (/^\+?[\d\s().-]{7,}$/.test(text.trim())) return { label: 'Phone', value: text };
  if (/^https?:\/\//i.test(text)) return { label: 'Web', value: text };
  return { label: 'Filed by', value: text };
}

function extractContacts(slide: Slide): Field[] {
  const cols = findFirst<Columns>(slide.blocks, 'columns');
  const fields: Field[] = [];
  const visit = (text: string) => fields.push(detectField(text));
  if (cols) {
    for (const col of cols.columns) {
      for (const block of col) {
        if (block.type === 'text') visit(block.text);
        if (block.type === 'heading') visit(block.text);
      }
    }
  } else {
    const texts = slide.blocks.filter((b): b is Text => b.type === 'text');
    texts.forEach((t) => visit(t.text));
  }
  return fields.slice(0, 3);
}

export function DossierCloser({ slide, client, date, dossier }: Props) {
  const fields = extractContacts(slide);
  const lead = slide.blocks.find((b): b is Text => b.type === 'text' && b.emphasis === 'lead');
  const editorial =
    lead?.text ??
    'Filed in confidence. The pages above are an account of one engagement at one moment in one company.';

  void client;

  return (
    <div className="dossier-closer">
      <h1 className="dossier-closer__thanks">
        <em>Thank you.</em>
      </h1>

      <p className="dossier-closer__note">{editorial}</p>

      {fields.length > 0 && (
        <div className="dossier-closer__contacts">
          {fields.map((f, i) => (
            <div className="dossier-closer__contact-row" key={i}>
              <span className="dossier-closer__field">{f.label}</span>
              <span className="dossier-closer__value">{f.value}</span>
            </div>
          ))}
        </div>
      )}

      <div className="dossier-closer__mark">
        <span className="dossier-closer__mark-monogram">
          <Monogram size={28} />
        </span>
        <span className="dossier-closer__fin" aria-hidden="true">
          Fin.
        </span>
      </div>

      <div className="dossier-closer__date">
        {date ?? '—'}
        {dossier ? <> · {dossier}</> : null}
      </div>
    </div>
  );
}
