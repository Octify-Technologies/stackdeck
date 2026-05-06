'use client';

import { useState } from 'react';

import { type Brand, LOGO_POSITIONS, type Palette } from '@/ir/schema';
import { deriveAccent, isValidHex } from '@/lib/color';
import { allPalettes, getPalette } from '@/themes/registry';
import { FONTS, getFont } from '@/themes/fonts';
import { getPreset } from '@/app/presets/presets';

import { ColorPicker } from './ColorPicker';

type Section = 'theme' | 'brand';

type Props = {
  presetId: string;
  paletteId: string;
  fontId?: string;
  brand: Brand;
  onPaletteChange: (id: string) => void;
  onFontChange: (id: string | undefined) => void;
  onBrandChange: (b: Brand) => void;
  onClose: () => void;
};

export function ThemeDrawer(props: Props) {
  const [section, setSection] = useState<Section>('theme');

  const palette = getPalette(props.paletteId);
  const surfaceForContrast = palette.tokens.surface;

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
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path
              d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
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
            presetId={props.presetId}
            paletteId={props.paletteId}
            fontId={props.fontId}
            onPaletteChange={props.onPaletteChange}
            onFontChange={props.onFontChange}
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
  presetId,
  paletteId,
  fontId,
  onPaletteChange,
  onFontChange,
}: {
  presetId: string;
  paletteId: string;
  fontId?: string;
  onPaletteChange: (id: string) => void;
  onFontChange: (id: string | undefined) => void;
}) {
  const preset = getPreset(presetId);
  const presetFont = getFont(preset.fontId);
  const activeId = fontId ?? preset.fontId;
  const activeFamily = getFont(activeId)?.family ?? presetFont?.family ?? 'system-ui';

  return (
    <div className="drawer__section">
      <Field label="Font">
        <div className="font-button-grid">
          {FONTS.map((f) => (
            <FontButton
              key={f.id}
              label={f.name}
              family={f.family}
              selected={f.id === activeId}
              onClick={() => onFontChange(f.id === preset.fontId ? undefined : f.id)}
            />
          ))}
        </div>
        <p
          className="font-preview"
          style={{ fontFamily: activeFamily }}
          aria-label="Active font preview"
        >
          The quick brown fox.
        </p>
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
    </div>
  );
}

function FontButton({
  label,
  family,
  selected,
  onClick,
}: {
  label: string;
  family: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-button ${selected ? 'font-button--selected' : ''}`}
      aria-pressed={selected}
      title={label}
    >
      <span className="font-button__sample" style={{ fontFamily: family }} aria-hidden>
        Aa
      </span>
      <span className="font-button__label" style={{ fontFamily: family }}>
        {label}
      </span>
    </button>
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
          value={brand.brandColor ?? '#c9a878'}
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
          value={brand.accentColor ?? '#c9a878'}
          onChange={(hex) => update({ accentColor: hex })}
          contrastAgainst={surfaceForContrast}
        />
      </Field>

      <button
        type="button"
        className="link-button link-button--danger"
        onClick={() => onBrandChange({})}
      >
        Reset brand
      </button>
    </div>
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
      <span style={{ background: palette.tokens.surface }} className="palette-swatch__half" />
      <span style={{ background: palette.tokens.accent }} className="palette-swatch__half" />
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
