/**
 * A tiny horizontal bar used to render a stat's relative magnitude against
 * a peer (used in the before/after composition). The fill width is a
 * percentage; the track is a hairline border.
 */
type Props = {
  /** 0 to 100. */
  pct: number;
  tone?: 'brass' | 'muted';
};

export function ScaleBar({ pct, tone = 'brass' }: Props) {
  const color = tone === 'brass' ? 'var(--color-brand)' : 'var(--color-text-muted)';
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className="dossier-scalebar" aria-hidden="true">
      <div className="dossier-scalebar__fill" style={{ width: `${clamped}%`, background: color }} />
    </div>
  );
}
