'use client';

import { useState } from 'react';

import {
  type Brand,
  DENSITIES,
  type Density,
  type FontOverrides,
  LOGO_POSITIONS,
  MODES,
  type Mode,
  type Palette,
} from '@/ir/schema';
import { deriveAccent, isValidHex } from '@/lib/color';
import { allPalettes, getPalette } from '@/themes/registry';
import { fontsForRole, getFont } from '@/themes/fonts';
import { getPreset } from '@/app/presets/presets';

import { ColorPicker } from './ColorPicker';

type Section = 'theme' | 'brand';

type FontRole = 'display' | 'body' | 'mono';

type Props = {
  presetId: string;
  paletteId: string;
  density: Density;
  mode: Mode;
  fonts: FontOverrides;
  brand: Brand;
  onPaletteChange: (id: string) => void;
  onDensityChange: (d: Density) => void;
  onModeChange: (m: Mode) => void;
  onFontsChange: (fonts: FontOverrides) => void;
  onBrandChange: (b: Brand) => void;
  onClose: () => void;
};

export function ThemeDrawer(props: Props) {
  const [section, setSection] = useState<Section>('theme');

  const palette = getPalette(props.paletteId);
  const surfaceForContrast = palette[props.mode].surface;

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
            density={props.density}
            mode={props.mode}
            fonts={props.fonts}
            onPaletteChange={props.onPaletteChange}
            onDensityChange={props.onDensityChange}
            onModeChange={props.onModeChange}
            onFontsChange={props.onFontsChange}
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
  density,
  mode,
  fonts,
  onPaletteChange,
  onDensityChange,
  onModeChange,
  onFontsChange,
}: {
  presetId: string;
  paletteId: string;
  density: Density;
  mode: Mode;
  fonts: FontOverrides;
  onPaletteChange: (id: string) => void;
  onDensityChange: (d: Density) => void;
  onModeChange: (m: Mode) => void;
  onFontsChange: (fonts: FontOverrides) => void;
}) {
  const preset = getPreset(presetId);

  const setFont = (role: FontRole, value: string | undefined) => {
    const next: FontOverrides = { ...fonts };
    if (value === undefined) delete next[role];
    else next[role] = value;
    onFontsChange(next);
  };

  return (
    <div className="drawer__section">
      <Field label="Fonts">
        <div className="font-picker-list">
          <FontPicker
            role="display"
            label="Display"
            sample="Aa"
            currentId={fonts.display}
            fallbackFamily={preset.fonts.display}
            onChange={(id) => setFont('display', id)}
          />
          <FontPicker
            role="body"
            label="Body"
            sample="Ag"
            currentId={fonts.body}
            fallbackFamily={preset.fonts.body}
            onChange={(id) => setFont('body', id)}
          />
          <FontPicker
            role="mono"
            label="Mono"
            sample="01"
            currentId={fonts.mono}
            fallbackFamily={preset.fonts.mono}
            onChange={(id) => setFont('mono', id)}
          />
        </div>
      </Field>

      <Field label="Palette">
        <div className="swatch-grid">
          {allPalettes.map((p) => (
            <PaletteSwatch
              key={p.id}
              palette={p}
              mode={mode}
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

function FontPicker({
  role,
  label,
  sample,
  currentId,
  fallbackFamily,
  onChange,
}: {
  role: FontRole;
  label: string;
  sample: string;
  currentId: string | undefined;
  fallbackFamily: string;
  onChange: (id: string | undefined) => void;
}) {
  const options = fontsForRole(role);
  const activeFamily = currentId ? (getFont(currentId)?.family ?? fallbackFamily) : fallbackFamily;
  const activeId = currentId ?? '__preset__';

  return (
    <div className="font-picker">
      <div className="font-picker__head">
        <span className="font-picker__label">{label}</span>
        <span className="font-picker__sample" style={{ fontFamily: activeFamily }} aria-hidden>
          {sample}
        </span>
      </div>
      <select
        className="font-picker__select"
        value={activeId}
        onChange={(e) => {
          const next = e.target.value;
          onChange(next === '__preset__' ? undefined : next);
        }}
        aria-label={`${label} font`}
      >
        <option value="__preset__">Preset default</option>
        {options.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>
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
        onClick={() => onBrandChange({})}
      >
        Reset brand
      </button>
    </div>
  );
}

function PaletteSwatch({
  palette,
  mode,
  selected,
  onClick,
}: {
  palette: Palette;
  mode: Mode;
  selected: boolean;
  onClick: () => void;
}) {
  const tokens = palette[mode];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`palette-swatch ${selected ? 'palette-swatch--selected' : ''}`}
      aria-pressed={selected}
      aria-label={palette.name}
      title={palette.name}
    >
      <span style={{ background: tokens.brand }} className="palette-swatch__half" />
      <span style={{ background: tokens.accent }} className="palette-swatch__half" />
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
