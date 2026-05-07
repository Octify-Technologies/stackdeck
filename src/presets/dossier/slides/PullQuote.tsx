import type { Slide } from '@/ir/schema';

import { BodyFrame } from '../atoms/Furniture';
import { extractQuote } from '../extract';

type Props = {
  slide: Slide;
  project: string;
  dossier?: string;
  folio: string;
  filed?: string;
  kicker?: string;
};

export function DossierPullQuote({
  slide,
  project,
  dossier,
  folio,
  filed,
  kicker = 'On the intervention',
}: Props) {
  const q = extractQuote(slide);
  if (!q) return null;

  const [name = '', ...rest] = (q.attribution ?? '').split(',').map((s) => s.trim());
  const role = rest[0] ?? '';
  const org = rest.slice(1).join(', ');

  return (
    <BodyFrame project={project} dossier={dossier} folio={folio} section="Voice from the field">
      <span className="dossier-quote__kicker">{kicker.toUpperCase()} · A QUOTE FROM THE ROOM</span>

      <div className="dossier-quote">
        <div className="dossier-quote__main">
          <div className="dossier-quote__bodywrap">
            <span className="dossier-quote__glyph" aria-hidden="true">
              {'“'}
            </span>
            <p className="dossier-quote__body">
              {q.text}
              {'”'}
            </p>
          </div>
        </div>

        <div className="dossier-quote__rail">
          <span className="dossier-quote__rail-kicker">ATTRIBUTION</span>
          {name && <span className="dossier-quote__name">{name}</span>}
          {role && <span className="dossier-quote__role">{role}</span>}
          {org && <span className="dossier-quote__org">{org}</span>}
          {filed && <span className="dossier-quote__filed">FILED · {filed.toUpperCase()}</span>}
        </div>
      </div>
    </BodyFrame>
  );
}
