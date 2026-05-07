import type { CSSProperties } from 'react';

/**
 * Oversized italic numeral or glyph used as a barely-visible compositional
 * anchor. Set in surfaceMuted on surface (just one notch above invisible)
 * and bleeds off the canvas edge. Used on cover, section divider, hero
 * stat, and closer.
 */
type Props = {
  text: string;
  /** Where the watermark anchors. Determines bleed direction. */
  position?: 'br' | 'bl' | 'tr' | 'tl' | 'right';
  /** Font size in px relative to the unscaled 1280px slide canvas. */
  size?: number;
};

const POSITIONS: Record<Required<Props>['position'], CSSProperties> = {
  br: { right: '-4%', bottom: '-12%' },
  bl: { left: '-6%', bottom: '-12%' },
  tr: { right: '-4%', top: '-8%' },
  tl: { left: '-6%', top: '-8%' },
  right: { right: '-6%', top: '20%' },
};

export function Watermark({ text, position = 'br', size = 480 }: Props) {
  const style: CSSProperties = {
    position: 'absolute',
    fontFamily: 'var(--font-fraunces), serif',
    fontStyle: 'italic',
    fontWeight: 400,
    lineHeight: 0.85,
    fontSize: `${size / 1280}em`,
    color: 'var(--color-surface-muted)',
    pointerEvents: 'none',
    userSelect: 'none',
    letterSpacing: '-0.04em',
    ...POSITIONS[position],
  };
  return (
    <span aria-hidden="true" className="dossier-watermark" style={style}>
      {text}
    </span>
  );
}
