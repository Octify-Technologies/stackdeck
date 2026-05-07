/**
 * A 60 x 18 inline sparkline, hairline stroke, set in brass. Pure SVG, no
 * dependencies. Used inside KPI cells to give each metric a tail of recent
 * trend without a full chart slide.
 */
type Props = {
  data: number[];
  width?: number;
  height?: number;
};

export function Sparkline({ data, width = 88, height = 22 }: Props) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const stepX = width / (data.length - 1);
  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - 2 - ((v - min) / span) * (height - 4);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const path = `M ${points.join(' L ')}`;
  const last = points[points.length - 1].split(',').map(Number);
  return (
    <svg
      className="dossier-sparkline"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Trend sparkline"
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={last[0]} cy={last[1]} r={1.8} fill="currentColor" />
    </svg>
  );
}
