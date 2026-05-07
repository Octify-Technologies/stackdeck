import type { Brand, LayoutId } from '@/ir/schema';

type Props = {
  brand: Brand | undefined;
  layout: LayoutId;
};

/**
 * Renders the brand logo as an absolutely positioned overlay on the slide.
 * Honors `brand.logoPosition`. The "cover-only" position shows the logo only
 * on slides with the `cover` layout, which is the most common author intent.
 * Decks render dark-only, so the dark logo variant is preferred when present.
 */
export function SlideLogo({ brand, layout }: Props) {
  if (!brand?.logoUrl && !brand?.logoDarkUrl) return null;

  const position = brand.logoPosition ?? 'cover-only';
  if (position === 'cover-only' && layout !== 'cover') return null;

  const src = brand.logoDarkUrl ?? brand.logoUrl ?? '';
  const alt = brand.name ? `${brand.name} logo` : 'Brand logo';

  const placement: Record<string, string> = {
    'top-left': 'slide-logo--top-left',
    'top-right': 'slide-logo--top-right',
    'bottom-left': 'slide-logo--bottom-left',
    'bottom-right': 'slide-logo--bottom-right',
    'cover-only': 'slide-logo--top-right',
  };

  return (
    <div className={`slide-logo ${placement[position]}`}>
      <img src={src} alt={alt} loading="lazy" />
    </div>
  );
}
