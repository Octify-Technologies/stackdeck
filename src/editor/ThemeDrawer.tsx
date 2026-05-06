'use client';

import { useState } from 'react';

import {
  type Brand,
  DENSITIES,
  type Density,
  LOGO_POSITIONS,
  MODES,
  type Mode,
  type Palette,
  type Style,
} from '@/ir/schema';
import { deriveAccent, isValidHex } from '@/lib/color';
import { allPalettes, allStyles, getPalette } from '@/themes/registry';

import { ColorPicker } from './ColorPicker';

type Section = 'theme' | 'brand';

type Props = {
  styleId: string;
  paletteId: string;
  density: Density;
  mode: Mode;
  brand: Brand;
  onStyleChange: (id: string) => void;
  onPaletteChange: (id: string) => void;
  onDensityChange: (d: Density) => void;
  onModeChange: (m: Mode) => void;
  onBrandChange: (b: Brand) => void;
  onClose: () => void;
};

export function ThemeDrawer(props: Props) {
  const [section, setSection] = useState<Section>('theme');

  const palette = getPalette(props.paletteId);
  const surfaceForContrast = palette.surface ?? (props.mode === 'dark' ? '#0a0a0a' : '#ffffff');

  return (
    <aside className="drawer" aria-label="Design system">
      <header className="drawer__header">
        <h2 className="drawer__title">Design</h2>
        <button
          type="button"
          className="drawer__close"
          onClick={props.onClose}
          aria-label="Close drawer"
        >
          ×
        </button>
      </header>

      <nav className="drawer__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={section === 'theme'}
          className={`drawer__tab ${section === 'theme' ? 'drawer__tab--active' : ''}`}
          onClick={() => setSection('theme')}
        >
          Theme
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={section === 'brand'}
          className={`drawer__tab ${section === 'brand' ? 'drawer__tab--active' : ''}`}
          onClick={() => setSection('brand')}
        >
          Brand
        </button>
      </nav>

      <div className="drawer__body">
        {section === 'theme' ? (
          <ThemeSection
            styleId={props.styleId}
            paletteId={props.paletteId}
            density={props.density}
            mode={props.mode}
            onStyleChange={props.onStyleChange}
            onPaletteChange={props.onPaletteChange}
            onDensityChange={props.onDensityChange}
            onModeChange={props.onModeChange}
          />
        ) : (
          <BrandSection
            brand={props.brand}
            surfaceForContrast={surfaceForContrast}
            onBrandChange={props.onBrandChange}
          />
        )}
      </div>
    </aside>
  );
}

function ThemeSection({
  styleId,
  paletteId,
  density,
  mode,
  onStyleChange,
  onPaletteChange,
  onDensityChange,
  onModeChange,
}: {
  styleId: string;
  paletteId: string;
  density: Density;
  mode: Mode;
  onStyleChange: (id: string) => void;
  onPaletteChange: (id: string) => void;
  onDensityChange: (d: Density) => void;
  onModeChange: (m: Mode) => void;
}) {
  return (
    <div className="drawer__section">
      <Field label="Style">
        <div className="card-grid">
          {allStyles.map((style) => (
            <StyleCard
              key={style.id}
              style={style}
              selected={style.id === styleId}
              onClick={() => onStyleChange(style.id)}
            />
          ))}
        </div>
      </Field>

      <Field label="Palette">
        <div className="swatch-grid">
          {allPalettes.map((p) => (
            <PaletteSwatch
              key={p.id}
              palette={p}
              selected={p.id === paletteId}
              onClick={() => onPaletteChange(p.id)}
            />
          ))}
        </div>
      </Field>

      <Field label="Density">
        <div className="segmented">
          {DENSITIES.map((d) => (
            <button
              key={d}
              type="button"
              className={`segmented__option ${d === density ? 'segmented__option--active' : ''}`}
              onClick={() => onDensityChange(d)}
            >
              {d}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Mode">
        <div className="segmented">
          {MODES.map((m) => (
            <button
              key={m}
              type="button"
              className={`segmented__option ${m === mode ? 'segmented__option--active' : ''}`}
              onClick={() => onModeChange(m)}
            >
              {m}
            </button>
          ))}
        </div>
      </Field>
    </div>
  );
}

function BrandSection({
  brand,
  surfaceForContrast,
  onBrandChange,
}: {
  brand: Brand;
  surfaceForContrast: string;
  onBrandChange: (b: Brand) => void;
}) {
  const update = (patch: Partial<Brand>) => onBrandChange({ ...brand, ...patch });

  return (
    <div className="drawer__section">
      <Field label="Brand name">
        <input
          type="text"
          value={brand.name ?? ''}
          onChange={(e) => update({ name: e.target.value || undefined })}
          placeholder="Acme Inc."
          className="text-input"
        />
      </Field>

      <Field label="Logo URL">
        <input
          type="url"
          value={brand.logoUrl ?? ''}
          onChange={(e) => update({ logoUrl: e.target.value || undefined })}
          placeholder="https://your-cdn.com/logo.svg"
          className="text-input"
        />
        <p className="field__hint">SVG or PNG, hosted publicly. Loaded from URL at render time.</p>
      </Field>

      <Field label="Logo URL (dark mode)">
        <input
          type="url"
          value={brand.logoDarkUrl ?? ''}
          onChange={(e) => update({ logoDarkUrl: e.target.value || undefined })}
          placeholder="Optional inverted variant"
          className="text-input"
        />
      </Field>

      <Field label="Logo position">
        <div className="segmented segmented--small">
          {LOGO_POSITIONS.map((pos) => (
            <button
              key={pos}
              type="button"
              className={`segmented__option ${
                (brand.logoPosition ?? 'cover-only') === pos ? 'segmented__option--active' : ''
              }`}
              onClick={() => update({ logoPosition: pos })}
            >
              {pos.replace('-', ' ')}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Brand color override">
        <ColorPicker
          label=""
          value={brand.brandColor ?? '#2563eb'}
          onChange={(hex) => update({ brandColor: hex })}
          contrastAgainst={surfaceForContrast}
        />
        {brand.brandColor && isValidHex(brand.brandColor) ? (
          <button
            type="button"
            className="link-button"
            onClick={() =>
              update({ accentColor: brand.brandColor ? deriveAccent(brand.brandColor) : undefined })
            }
          >
            Auto-derive accent
          </button>
        ) : null}
      </Field>

      <Field label="Accent color override">
        <ColorPicker
          label=""
          value={brand.accentColor ?? '#a855f7'}
          onChange={(hex) => update({ accentColor: hex })}
          contrastAgainst={surfaceForContrast}
        />
      </Field>

      <button
        type="button"
        className="link-button link-button--danger"
        onClick={() =>
          onBrandChange({
            name: undefined,
            logoUrl: undefined,
            logoDarkUrl: undefined,
            logoPosition: undefined,
            brandColor: undefined,
            accentColor: undefined,
          })
        }
      >
        Reset brand
      </button>
    </div>
  );
}

function StyleCard({
  style,
  selected,
  onClick,
}: {
  style: Style;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`style-card ${selected ? 'style-card--selected' : ''}`}
      aria-pressed={selected}
    >
      <span className="style-card__name" style={{ fontFamily: style.typography.display.family }}>
        Aa
      </span>
      <span className="style-card__label">{style.name}</span>
    </button>
  );
}

function PaletteSwatch({
  palette,
  selected,
  onClick,
}: {
  palette: Palette;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`palette-swatch ${selected ? 'palette-swatch--selected' : ''}`}
      aria-pressed={selected}
      aria-label={palette.name}
      title={palette.name}
    >
      <span style={{ background: palette.brand }} className="palette-swatch__half" />
      <span style={{ background: palette.accent }} className="palette-swatch__half" />
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="field">
      {label ? <span className="field__label">{label}</span> : null}
      {children}
    </div>
  );
}
