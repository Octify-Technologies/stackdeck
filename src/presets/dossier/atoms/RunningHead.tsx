/**
 * The thin masthead-style strip that sits at the top of every body slide.
 * Project name on the left, dossier id + folio on the right, hairline below.
 * This is the "running head" that gives the deck its serial-publication feel.
 */
type Props = {
  project: string;
  dossier?: string;
  folio: string;
  section?: string;
};

export function RunningHead({ project, dossier, folio, section }: Props) {
  return (
    <div className="dossier-runhead">
      <span className="dossier-runhead__left">
        <span className="dossier-runhead__brand">{project}</span>
        {section && <span className="dossier-runhead__section">— {section}</span>}
      </span>
      <span className="dossier-runhead__right">
        {dossier && <span className="dossier-runhead__dossier">{dossier}</span>}
        <span className="dossier-runhead__folio">{folio}</span>
      </span>
    </div>
  );
}
