import type { Slide, Stat, Text } from '@/ir/schema';

import { BodyFrame } from '../atoms/Furniture';
import { findFirst, splitStatValue } from '../extract';

type Props = {
  slide: Slide;
  project: string;
  dossier?: string;
  folio: string;
  section?: string;
  figure?: string;
};

export function DossierHeroStat({
  slide,
  project,
  dossier,
  folio,
  section,
  figure = 'Fig. 01',
}: Props) {
  const stat = findFirst<Stat>(slide.blocks, 'stat');
  if (!stat) return null;
  const { prefix, number, suffix } = splitStatValue(stat.value);

  const captions = slide.blocks.filter(
    (b): b is Text => b.type === 'text' && b.emphasis === 'caption',
  );
  const sourceText = captions.find((c) => /^source:/i.test(c.text))?.text;
  const definition = captions
    .find((c) => /^def(inition)?:/i.test(c.text))
    ?.text.replace(/^def(inition)?:\s*/i, '');
  const method = captions.find((c) => /^method:/i.test(c.text))?.text.replace(/^method:\s*/i, '');

  const context = slide.blocks.find(
    (b): b is Text => b.type === 'text' && b.emphasis !== 'caption',
  );

  const labelParts = (stat.label ?? 'Key metric').split('/');
  const labelHead = labelParts[0]?.trim() ?? 'Key metric';
  const period = labelParts[1]?.trim() ?? '';

  return (
    <BodyFrame project={project} dossier={dossier} folio={folio} section={section ?? 'Hero metric'}>
      <div className="dossier-hero__figheader">
        <span className="dossier-hero__figlabel">
          {figure} · {labelHead}
        </span>
        <span className="dossier-hero__figperiod">{period || '—'}</span>
      </div>

      <div className="dossier-hero">
        <aside className="dossier-hero__sidebar">
          <div className="dossier-hero__sidebar-block">
            <span className="dossier-hero__sidebar-label">Definition</span>
            <p className="dossier-hero__sidebar-text">
              {definition ??
                'Pipeline value created by accounts not previously in the outbound list.'}
            </p>
          </div>
          <div className="dossier-hero__sidebar-block">
            <span className="dossier-hero__sidebar-label">Method</span>
            <p className="dossier-hero__sidebar-text">
              {method ?? 'HubSpot weighted forecast, weekly snapshot.'}
            </p>
          </div>
        </aside>

        <div className="dossier-hero__main">
          <p className="dossier-hero__value">
            {prefix && <span className="dossier-hero__unit">{prefix}</span>}
            {number}
            {suffix && <span className="dossier-hero__unit">{suffix}</span>}
          </p>

          <div className="dossier-hero__delta">
            {stat.delta && <span className="dossier-hero__delta-pct">{stat.delta}</span>}
            <span className="dossier-hero__delta-text">
              {context?.text ?? 'Sustained over the engagement window.'}
            </span>
          </div>
        </div>
      </div>

      {sourceText && <span className="dossier-hero__source">{sourceText}</span>}
    </BodyFrame>
  );
}
