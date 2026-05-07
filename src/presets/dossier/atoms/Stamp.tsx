import type { CSSProperties } from 'react';

/**
 * A rotated rubber-stamp style mark, used for editorial accents like
 * "CASE FILE 014", "VERIFIED", "FIN". Set in mono small caps inside a
 * hairline rectangle, slightly rotated to feel hand-applied.
 */
type Props = {
  text: string;
  tone?: 'oxblood' | 'brass' | 'muted';
  rotate?: number;
  style?: CSSProperties;
};

export function Stamp({ text, tone = 'oxblood', rotate = -6, style }: Props) {
  const color =
    tone === 'oxblood'
      ? 'var(--color-accent)'
      : tone === 'brass'
        ? 'var(--color-brand)'
        : 'var(--color-text-muted)';
  return (
    <span
      className="dossier-stamp"
      style={{
        color,
        borderColor: color,
        transform: `rotate(${rotate}deg)`,
        ...style,
      }}
    >
      {text}
    </span>
  );
}
