type Props = {
  size?: number;
  className?: string;
};

export function StackdeckMark({ size = 22, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      className={className}
      aria-hidden
    >
      <rect x="1.8" y="6.9" width="12" height="12" rx="2.6" fill="#d4d4d8" />
      <rect x="5" y="5" width="12" height="12" rx="2.6" fill="#737373" />
      <rect x="8.2" y="3.1" width="12" height="12" rx="2.6" fill="#0a0a0a" />
    </svg>
  );
}
