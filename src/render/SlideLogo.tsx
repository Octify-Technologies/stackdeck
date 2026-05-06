import type { Brand, LayoutId, Mode } from '@/ir/schema';

type Props = {
  brand: Brand | undefined;
  layout: LayoutId;
  mode: Mode;
};

/**
 * Renders the brand logo as an absolutely positioned overlay on the slide.
 * Honors `brand.logoPosition`. The "cover-only" position shows the logo only
 * on slides with the `cover` layout, which is the most common author intent.
 */
export function SlideLogo({ brand, layout, mode }: Props) {
  if (!brand?.logoUrl) return null;

  const position = brand.logoPosition ?? 'cover-only';
  if (position === 'cover-only' && layout !== 'cover') return null;

  const src = mode === 'dark' && brand.logoDarkUrl ? brand.logoDarkUrl : brand.logoUrl;
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
