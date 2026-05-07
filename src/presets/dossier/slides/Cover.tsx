import type { Deck, Slide } from '@/ir/schema';

import { Masthead } from '../atoms/Masthead';
import { Monogram } from '../atoms/Monogram';
import { extractTitleSubtitle } from '../extract';

type Props = {
  slide: Slide;
  deck: Deck;
  client?: string;
  date?: string;
  dossier?: string;
  issueNumber?: string;
};

export function DossierCover({ slide, deck, client, date, dossier, issueNumber }: Props) {
  const { title, subtitle } = extractTitleSubtitle(slide);
  const issue = issueNumber ?? dossier ?? 'Issue 014';
  // Suppress the optional deck arg lint without changing the public signature.
  void deck;

  return (
    <div className="dossier-cover">
      <Masthead vol="VOL. III" issue={issue} date={date} />

      <span className="dossier-cover__kicker">
        Field Study <span className="dossier-cover__kicker-sep">·</span>{' '}
        {client ?? 'Client Confidential'}
      </span>

      {title && (
        <h1 className="dossier-cover__title">
          <em>{title}</em>
        </h1>
      )}

      {subtitle && <p className="dossier-cover__dek">{subtitle}</p>}

      <div className="dossier-cover__signoff">
        <span className="dossier-cover__signoff-mark">
          <Monogram size={28} />
        </span>
        <span className="dossier-cover__signoff-label">Octify · Strategy Desk</span>
      </div>
    </div>
  );
}
