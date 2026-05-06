import type { Chart as ChartBlock, ChartDatum } from '@/ir/schema';

function formatValue(
  value: number,
  format?: ChartBlock['format'],
  prefix?: string,
  suffix?: string,
): string {
  let text: string;
  if (format === 'percent') {
    text = `${value}%`;
  } else if (format === 'currency') {
    text = `$${value.toLocaleString()}`;
  } else {
    text = value.toLocaleString();
  }
  return `${prefix ?? ''}${text}${suffix ?? ''}`;
}

function BarChart({ block }: { block: ChartBlock }) {
  const max = Math.max(...block.data.map((d) => d.value), 0) || 1;
  return (
    <div className="chart chart--bar">
      {block.title ? <div className="chart__title">{block.title}</div> : null}
      <div className="chart__bars" role="list">
        {block.data.map((d, i) => (
          <BarRow key={i} datum={d} max={max} block={block} />
        ))}
      </div>
    </div>
  );
}

function BarRow({ datum, max, block }: { datum: ChartDatum; max: number; block: ChartBlock }) {
  const pct = (datum.value / max) * 100;
  return (
    <div className="chart__bar-row" role="listitem">
      <span className="chart__bar-label">{datum.label}</span>
      <div className="chart__bar-track">
        <div className="chart__bar-fill" style={{ width: `${pct}%` }} />
        <span className="chart__bar-value">
          {formatValue(datum.value, block.format, block.prefix, block.suffix)}
        </span>
      </div>
    </div>
  );
}

function LineChart({ block }: { block: ChartBlock }) {
  const w = 800;
  const h = 280;
  const pad = { top: 24, right: 32, bottom: 36, left: 48 };
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;

  const max = Math.max(...block.data.map((d) => d.value), 0);
  const min = Math.min(...block.data.map((d) => d.value), 0);
  const range = max - min || 1;
  const stepX = block.data.length > 1 ? innerW / (block.data.length - 1) : 0;

  const points = block.data.map((d, i) => ({
    x: pad.left + i * stepX,
    y: pad.top + innerH - ((d.value - min) / range) * innerH,
  }));

  const path = points.reduce(
    (acc, p, i) => acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`),
    '',
  );
  const area = `${path} L ${pad.left + innerW} ${pad.top + innerH} L ${pad.left} ${pad.top + innerH} Z`;

  return (
    <div className="chart chart--line">
      {block.title ? <div className="chart__title">{block.title}</div> : null}
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="chart__svg"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={block.title ?? 'Line chart'}
      >
        {[0, 1, 2, 3].map((i) => {
          const y = pad.top + (i * innerH) / 3;
          return (
            <line
              key={i}
              x1={pad.left}
              x2={pad.left + innerW}
              y1={y}
              y2={y}
              className="chart__gridline"
            />
          );
        })}
        <path d={area} className="chart__line-area" />
        <path d={path} className="chart__line-stroke" fill="none" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4} className="chart__line-dot" />
        ))}
        {block.data.map((d, i) => (
          <text
            key={i}
            x={points[i].x}
            y={h - pad.bottom + 22}
            className="chart__label"
            textAnchor="middle"
          >
            {d.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

function DonutChart({ block }: { block: ChartBlock }) {
  const total = block.data.reduce((a, d) => a + d.value, 0) || 1;
  const r = 64;
  const C = 2 * Math.PI * r;
  let offset = 0;

  const segments = block.data.map((d, i) => {
    const fraction = d.value / total;
    const length = C * fraction;
    const seg = (
      <circle
        key={i}
        cx={100}
        cy={100}
        r={r}
        fill="none"
        strokeWidth="32"
        strokeDasharray={`${length} ${C - length}`}
        strokeDashoffset={-offset}
        className={`chart__donut-seg chart__donut-seg--${i % 4}`}
      />
    );
    offset += length;
    return seg;
  });

  return (
    <div className="chart chart--donut">
      {block.title ? <div className="chart__title">{block.title}</div> : null}
      <div className="chart__donut-wrap">
        <svg
          viewBox="0 0 200 200"
          className="chart__svg"
          role="img"
          aria-label={block.title ?? 'Donut chart'}
        >
          <circle
            cx={100}
            cy={100}
            r={r}
            fill="none"
            strokeWidth="32"
            className="chart__donut-track"
          />
          {segments}
        </svg>
        <ul className="chart__donut-legend">
          {block.data.map((d, i) => (
            <li key={i}>
              <span className={`chart__donut-marker chart__donut-marker--${i % 4}`} />
              <span className="chart__donut-label">{d.label}</span>
              <span className="chart__donut-value">
                {formatValue(d.value, block.format, block.prefix, block.suffix)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Chart({ block }: { block: ChartBlock }) {
  if (block.kind === 'line') return <LineChart block={block} />;
  if (block.kind === 'donut') return <DonutChart block={block} />;
  return <BarChart block={block} />;
}
