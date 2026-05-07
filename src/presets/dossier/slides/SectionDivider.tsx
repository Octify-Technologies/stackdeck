import type { Heading, Slide, Text } from '@/ir/schema';

import { findFirst } from '../extract';

type Props = {
  slide: Slide;
  chapterIndex: number;
  pageStart: number;
  pageEnd: number;
  project: string;
  dossier?: string;
};

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

export function DossierSection({
  slide,
  chapterIndex,
  pageStart,
  pageEnd,
  project,
  dossier,
}: Props) {
  const heading = findFirst<Heading>(slide.blocks, 'heading');
  const dek = slide.blocks.find(
    (b): b is Text => b.type === 'text' && (b.emphasis === 'lead' || b.emphasis === 'normal'),
  );
  const roman = ROMAN[chapterIndex] ?? String(chapterIndex);
  const pad = (n: number) => String(n).padStart(2, '0');
  const dossierLabel = dossier ?? 'DOSSIER';

  const dateCap = slide.blocks.find(
    (b): b is Text => b.type === 'text' && b.emphasis === 'caption' && /\d{4}/.test(b.text),
  );

  return (
    <div className="dossier-section">
      <div className="dossier-section__topstrip">
        <span className="dossier-section__topleft">
          {dossierLabel} · {project}
        </span>
        <span className="dossier-section__topright">{dateCap?.text ?? ''}</span>
      </div>

      <span className="dossier-section__numeral" aria-hidden="true" data-chapter={roman}>
        {roman}
      </span>

      <div className="dossier-section__panel">
        <span className="dossier-section__kicker">Part {roman}</span>
        {heading && <h2 className="dossier-section__title">{heading.text}</h2>}
        {dek && <p className="dossier-section__dek">{dek.text}</p>}
        <span className="dossier-section__pages">
          pp. {pad(pageStart)} {'—'} {pad(pageEnd)}
        </span>
      </div>
    </div>
  );
}
