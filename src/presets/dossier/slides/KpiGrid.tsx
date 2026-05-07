import type { Slide, Stat } from '@/ir/schema';

import { BodyFrame } from '../atoms/Furniture';
import { Sparkline } from '../atoms/Sparkline';
import { extractKpis } from '../extract';

type Props = {
  slide: Slide;
  project: string;
  dossier?: string;
  folio: string;
  section?: string;
  figure?: string;
  date?: string;
};

function deltaTone(stat: Stat): 'up' | 'down' | 'flat' {
  if (stat.trend) return stat.trend;
  const d = stat.delta?.trim() ?? '';
  if (d.startsWith('-') || d.startsWith('−')) return 'down';
  if (d.startsWith('+')) return 'up';
  return 'flat';
}

function sparkData(stat: Stat, idx: number): number[] {
  const numeric = parseFloat(stat.value.replace(/[^\d.-]/g, '')) || 1;
  const tone = deltaTone(stat);
  const upSeq = [0.4, 0.48, 0.55, 0.6, 0.68, 0.78, 0.9, 1];
  const downSeq = [1, 0.94, 0.86, 0.78, 0.66, 0.54, 0.42, 0.34];
  const flatSeq = [0.92, 0.96, 0.94, 1.0, 0.97, 1.02, 0.98, 1];
  const base = tone === 'down' ? downSeq : tone === 'flat' ? flatSeq : upSeq;
  const offset = (idx * 7) % base.length;
  return base.map((m, i) => numeric * m * (1 + (((i + offset) % 3) - 1) * 0.025));
}

export function DossierKpiGrid({
  slide,
  project,
  dossier,
  folio,
  section,
  figure = 'Fig. 02',
  date,
}: Props) {
  const { stats, source } = extractKpis(slide);
  if (stats.length === 0) return null;
  const cells = stats.slice(0, 6);

  return (
    <BodyFrame
      project={project}
      dossier={dossier}
      folio={folio}
      section={section ?? 'Performance Dashboard'}
    >
      <div className="dossier-kpi">
        <div className="dossier-kpi__figheader">
          <span className="dossier-kpi__figlabel">Performance Dashboard.</span>
          <span className="dossier-kpi__figmeta">{figure}</span>
          <span className="dossier-kpi__figperiod">{date ?? source ?? 'Engagement period'}</span>
        </div>

        <div className="dossier-kpi__grid">
          {cells.map((stat, i) => {
            const tone = deltaTone(stat);
            const arrow = tone === 'down' ? '▾' : tone === 'up' ? '▴' : '·';
            return (
              <div className="dossier-kpi__cell" key={i}>
                <div className="dossier-kpi__cell-label">{stat.label ?? `Metric ${i + 1}`}</div>
                <div className="dossier-kpi__cell-row">
                  <p className="dossier-kpi__cell-value">{stat.value}</p>
                  <span className="dossier-kpi__cell-spark">
                    <Sparkline data={sparkData(stat, i)} width={132} height={36} />
                  </span>
                </div>
                <div className="dossier-kpi__cell-foot">
                  {stat.delta && (
                    <span
                      className={`dossier-kpi__cell-delta${
                        tone === 'down' ? ' dossier-kpi__cell-delta--down' : ''
                      }`}
                    >
                      {arrow} {stat.delta}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="dossier-kpi__source">
          <span>Source · {source ?? 'Internal CRM, weekly snapshots'}</span>
        </div>
      </div>
    </BodyFrame>
  );
}
