import type { ReactNode } from 'react';

import { RunningHead } from './RunningHead';
import { Spine } from './Spine';

/**
 * Body slide chrome: vertical spine on the far-left margin, running head
 * across the top with hairline below, drop folio at the bottom-right.
 * Wrap any body slide in this so the editorial frame is consistent.
 */
type Props = {
  project: string;
  dossier?: string;
  folio: string;
  section?: string;
  chapter?: string;
  children: ReactNode;
};

export function BodyFrame({ project, dossier, folio, section, chapter, children }: Props) {
  return (
    <>
      <Spine chapter={chapter} title={section} />
      <RunningHead project={project} dossier={dossier} folio={folio} section={section} />
      {children}
      <span className="dossier-folio">{folio}</span>
    </>
  );
}
