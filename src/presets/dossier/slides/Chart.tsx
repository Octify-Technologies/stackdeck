import type { Slide, Text } from '@/ir/schema';

import { BodyFrame } from '../atoms/Furniture';
import { findChart } from '../extract';

type Props = {
  slide: Slide;
  project: string;
  dossier?: string;
  folio: string;
  section?: string;
  figure?: string;
};

const PAD = { left: 24, right: 96, top: 56, bottom: 40 };

export function DossierChart({
  slide,
  project,
  dossier,
  folio,
  section,
  figure = 'Fig. 04',
}: Props) {
  const chart = findChart(slide);
  if (!chart) return null;

  const captions = slide.blocks.filter(
    (b): b is Text => b.type === 'text' && b.emphasis === 'caption',
  );
  const sourceText = captions.find((c) => /^source:/i.test(c.text))?.text;
  const readText = slide.blocks.find(
    (b): b is Text => b.type === 'text' && b.emphasis !== 'caption',
  );

  return (
    <BodyFrame project={project} dossier={dossier} folio={folio} section={section ?? 'Trend'}>
      <div className="dossier-chart">
        <div className="dossier-chart__figheader">
          <span className="dossier-chart__figlabel">{chart.title ?? 'Trend'}</span>
          <span className="dossier-chart__figmeta">{figure}</span>
          <span className="dossier-chart__figperiod">{chart.data.length} pts</span>
        </div>

        <div className="dossier-chart__canvas">
          <ChartSvg chart={chart} />
        </div>

        {readText && (
          <div className="dossier-chart__read">
            <span className="dossier-chart__read-label">Read</span>
            <p className="dossier-chart__read-body">{readText.text}</p>
          </div>
        )}

        {sourceText && <span className="dossier-chart__source">{sourceText}</span>}
      </div>
    </BodyFrame>
  );
}

function ChartSvg({ chart }: { chart: NonNullable<ReturnType<typeof findChart>> }) {
  const W = 1080;
  const H = 320;
  const inner = {
    x0: PAD.left,
    x1: W - PAD.right,
    y0: PAD.top,
    y1: H - PAD.bottom,
  };
  const max = Math.max(...chart.data.map((d) => d.value));
  const yAt = (v: number) => inner.y1 - (v / (max || 1)) * (inner.y1 - inner.y0);

  const peakIdx = chart.data.reduce(
    (best, d, i) => (d.value > chart.data[best].value ? i : best),
    0,
  );

  const gridlines = [0, 0.5, 1].map((f) => {
    const y = inner.y1 - f * (inner.y1 - inner.y0);
    const v = Math.round(max * f);
    return { y, label: String(v) };
  });

  return (
    <svg className="dossier-chart__svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      {gridlines.map((g, i) => (
        <g key={i}>
          <line className="dossier-chart__grid" x1={inner.x0} x2={inner.x1} y1={g.y} y2={g.y} />
          <text className="dossier-chart__ytick" x={inner.x1 + 16} y={g.y + 3}>
            {g.label}
          </text>
        </g>
      ))}

      {chart.kind === 'line'
        ? renderLine(chart.data, yAt, inner)
        : renderBars(chart.data, yAt, inner, peakIdx)}

      {chart.data.map((d, i) => {
        const slot = (inner.x1 - inner.x0) / chart.data.length;
        const x = inner.x0 + slot * i + slot / 2;
        return (
          <text key={i} className="dossier-chart__xtick" x={x} y={H - 10} textAnchor="middle">
            {pad2(d.label)}
          </text>
        );
      })}
    </svg>
  );
}

function pad2(s: string): string {
  if (/^\d+$/.test(s)) return s.padStart(2, '0');
  return s.toUpperCase();
}

function renderBars(
  data: { label: string; value: number }[],
  yAt: (v: number) => number,
  inner: { x0: number; x1: number; y0: number; y1: number },
  peakIdx: number,
) {
  const slot = (inner.x1 - inner.x0) / data.length;
  const barW = Math.min(slot * 0.55, 56);
  return data.map((d, i) => {
    const x = inner.x0 + slot * i + (slot - barW) / 2;
    const y = yAt(d.value);
    const h = inner.y1 - y;
    const isPeak = i === peakIdx;
    return (
      <g key={i}>
        <rect
          className={`dossier-chart__bar${isPeak ? ' dossier-chart__bar--peak' : ''}`}
          x={x}
          y={y}
          width={barW}
          height={h}
        />
        <text
          className="dossier-chart__valuetick"
          x={x + barW / 2}
          y={y - 8}
          textAnchor="middle"
          style={{
            fill: isPeak ? 'var(--color-brand)' : 'var(--color-text)',
          }}
        >
          {String(d.value)}
        </text>
        {isPeak && (
          <text
            className="dossier-chart__annotation"
            x={x + barW / 2}
            y={y - 26}
            textAnchor="middle"
          >
            peak · {d.value}
          </text>
        )}
      </g>
    );
  });
}

function renderLine(
  data: { label: string; value: number }[],
  yAt: (v: number) => number,
  inner: { x0: number; x1: number; y0: number; y1: number },
) {
  if (data.length < 2) return null;
  const slot = (inner.x1 - inner.x0) / (data.length - 1);
  const points = data.map((d, i) => ({
    x: inner.x0 + slot * i,
    y: yAt(d.value),
    label: d.label,
    value: d.value,
  }));
  const path = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
  const peak = points.reduce((best, p) => (p.value > best.value ? p : best), points[0]);
  return (
    <>
      <path className="dossier-chart__line" d={path} />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="var(--color-brand)" />
      ))}
      <text className="dossier-chart__annotation" x={peak.x} y={peak.y - 14} textAnchor="middle">
        peak · {peak.value}
      </text>
    </>
  );
}
