import type { Slide } from '@/ir/schema';

import { BodyFrame } from '../atoms/Furniture';
import { ScaleBar } from '../atoms/ScaleBar';
import { extractBeforeAfter } from '../extract';

type Props = {
  slide: Slide;
  project: string;
  dossier?: string;
  folio: string;
  figure?: string;
};

function numeric(value: string | undefined): number {
  if (!value) return 0;
  const m = /-?\d+(?:\.\d+)?/.exec(value);
  return m ? parseFloat(m[0]) : 0;
}

function deltaSummary(
  beforeStat?: string,
  afterStat?: string,
): {
  short: string;
  long: string;
} {
  if (!beforeStat || !afterStat) return { short: '', long: '' };
  const a = numeric(afterStat);
  const b = numeric(beforeStat);
  if (b === 0) return { short: '', long: '' };
  const diff = a - b;
  const pct = ((diff / b) * 100).toFixed(0);
  const sign = diff >= 0 ? '+' : '';
  if (beforeStat.includes('%') || afterStat.includes('%')) {
    return {
      short: `${sign}${diff.toFixed(0)} PTS`,
      long: `${sign}${diff.toFixed(0)} PTS VS BASELINE`,
    };
  }
  return {
    short: `${sign}${pct}%`,
    long: `${sign}${pct}% VS BASELINE`,
  };
}

export function DossierBeforeAfter({ slide, project, dossier, folio, figure = 'Fig. 03' }: Props) {
  const { before, after } = extractBeforeAfter(slide);

  const max = Math.max(numeric(before.stat), numeric(after.stat), 1);
  const beforePct = (numeric(before.stat) / max) * 100;
  const afterPct = (numeric(after.stat) / max) * 100;
  const delta = deltaSummary(before.stat, after.stat);

  return (
    <BodyFrame project={project} dossier={dossier} folio={folio} section="Transformation">
      <div className="dossier-ba">
        <div className="dossier-ba__figheader">
          <span className="dossier-ba__figlabel">The transformation, in one frame.</span>
          <span className="dossier-ba__figmeta">{figure.toUpperCase()}</span>
          <span className="dossier-ba__figdots" aria-hidden="true" />
          <span className="dossier-ba__figdate">Before / After</span>
        </div>

        <div className="dossier-ba__split">
          <div className="dossier-ba__side dossier-ba__side--left">
            <span className="dossier-ba__kicker">BEFORE</span>
            <span className="dossier-ba__metric">
              {(before.label ?? 'Baseline reading').toUpperCase()}
            </span>
            <p className="dossier-ba__value">{before.stat ?? '—'}</p>
            <ScaleBar pct={beforePct} tone="muted" />
            {before.body && <p className="dossier-ba__body">{before.body}</p>}
          </div>

          <div className="dossier-ba__divider" aria-hidden="true">
            <span className="dossier-ba__arrow" aria-hidden="true">
              {'→'}
            </span>
            {delta.short && <span className="dossier-ba__arrow-label">{delta.short}</span>}
          </div>

          <div className="dossier-ba__side dossier-ba__side--right">
            <span className="dossier-ba__kicker">AFTER</span>
            <span className="dossier-ba__metric">
              {(after.label ?? 'Post intervention').toUpperCase()}
            </span>
            <p className="dossier-ba__value">{after.stat ?? '—'}</p>
            <ScaleBar pct={afterPct} tone="brass" />
            {after.body && <p className="dossier-ba__body">{after.body}</p>}
          </div>
        </div>
      </div>
    </BodyFrame>
  );
}
