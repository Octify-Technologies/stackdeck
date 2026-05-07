import type { Slide, Text } from '@/ir/schema';

import { DottedLeader } from '../atoms/DottedLeader';
import { BodyFrame } from '../atoms/Furniture';
import { extractTearRows } from '../extract';

type Props = {
  slide: Slide;
  project: string;
  dossier?: string;
  folio: string;
  filedBy?: string;
  filedOn?: string;
};

export function DossierTearSheet({ slide, project, dossier, folio, filedBy, filedOn }: Props) {
  const rows = extractTearRows(slide);
  const lead = slide.blocks.find((b): b is Text => b.type === 'text' && b.emphasis === 'lead');

  return (
    <BodyFrame project={project} dossier={dossier} folio={folio} section="Engagement Record">
      <div className="dossier-tear">
        <span className="dossier-tear__kicker">Engagement Record</span>

        <div className="dossier-tear__grid">
          <div className="dossier-tear__ledger">
            {rows.map((r, i) => (
              <DottedLeader key={i} label={r.label} value={r.value} />
            ))}
          </div>

          <div className="dossier-tear__outcome">
            {lead && <p className="dossier-tear__statement">{lead.text}</p>}
          </div>
        </div>
      </div>

      <div className="dossier-tear__signoff">
        <span>Filed by · {filedBy ?? 'Octify Strategy Desk'}</span>
        <span>{filedOn ?? '—'}</span>
      </div>
    </BodyFrame>
  );
}
