/**
 * Brass monogram mark, 32 x 32. A circular outline with an italic 'O'
 * letterform inside. Used bottom-right of cover and closer.
 */
export function Monogram({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="Monogram"
      className="dossier-monogram"
    >
      <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="1" fill="none" />
      <text
        x="16"
        y="22"
        textAnchor="middle"
        fontFamily="var(--font-fraunces), serif"
        fontStyle="italic"
        fontSize="18"
        fill="currentColor"
      >
        O
      </text>
    </svg>
  );
}
