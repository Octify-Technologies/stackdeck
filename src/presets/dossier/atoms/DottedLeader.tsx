import type { ReactNode } from 'react';

/**
 * A label / dotted-leader / value row, the kind that anchors a tear sheet
 * or a table of contents in a print magazine. The leader fills the gap
 * with a row of dots, optically aligned with the baseline of the labels.
 */
type Props = {
  label: ReactNode;
  value: ReactNode;
  /** Adjusts the leader's prominence. Default is a fine dotted gray. */
  emphasis?: 'normal' | 'strong';
};

export function DottedLeader({ label, value, emphasis = 'normal' }: Props) {
  return (
    <div className={`dossier-leader dossier-leader--${emphasis}`}>
      <span className="dossier-leader__label">{label}</span>
      <span className="dossier-leader__dots" aria-hidden="true" />
      <span className="dossier-leader__value">{value}</span>
    </div>
  );
}
