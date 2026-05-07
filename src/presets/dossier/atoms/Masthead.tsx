/**
 * The cover masthead: VOL · ISSUE · DATE strip across the top, hairline
 * below. Mirrors the way a print magazine identifies its edition before
 * any feature content.
 */
type Props = {
  vol?: string;
  issue?: string;
  date?: string;
};

export function Masthead({ vol = 'VOL. III', issue, date }: Props) {
  return (
    <div className="dossier-masthead">
      <span className="dossier-masthead__cell">{vol}</span>
      {issue && (
        <span className="dossier-masthead__cell dossier-masthead__cell--center">{issue}</span>
      )}
      {date && <span className="dossier-masthead__cell dossier-masthead__cell--right">{date}</span>}
    </div>
  );
}
