/**
 * The vertical chapter mark that hugs the far-left margin of body slides.
 * Reads bottom-up: "§ II / THE DIAGNOSIS". This is the editorial spine
 * that ties multi-page sections together visually.
 */
type Props = {
  chapter?: string;
  title?: string;
};

export function Spine({ chapter, title }: Props) {
  if (!chapter && !title) return null;
  return (
    <div className="dossier-spine" aria-hidden="true">
      <span className="dossier-spine__inner">
        {chapter && <span className="dossier-spine__chapter">{chapter}</span>}
        {chapter && title && <span className="dossier-spine__sep"> / </span>}
        {title && <span className="dossier-spine__title">{title}</span>}
      </span>
    </div>
  );
}
