'use client';

import { useEffect, useState } from 'react';

import { contrastRatio, isValidHex } from '@/lib/color';

type Props = {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  contrastAgainst?: string;
};

/**
 * Compact color picker: native swatch on the left, hex input on the right,
 * optional contrast badge against a background color.
 */
export function ColorPicker({ label, value, onChange, contrastAgainst }: Props) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const commit = (next: string) => {
    if (isValidHex(next)) {
      const normalized = next.startsWith('#') ? next : `#${next}`;
      onChange(normalized.toLowerCase());
    }
  };

  const ratio = contrastAgainst && isValidHex(value) ? contrastRatio(value, contrastAgainst) : null;
  const passesAA = ratio !== null && ratio >= 4.5;
  const passesAALarge = ratio !== null && ratio >= 3;

  return (
    <div className="color-picker">
      <span className="color-picker__label">{label}</span>
      <div className="color-picker__row">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} color`}
          className="color-picker__swatch"
        />
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => commit(draft)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit(draft);
          }}
          aria-label={`${label} hex value`}
          spellCheck={false}
          className="color-picker__hex"
          placeholder="#000000"
        />
      </div>
      {ratio !== null ? (
        <span
          className={`color-picker__contrast ${
            passesAA
              ? 'color-picker__contrast--ok'
              : passesAALarge
                ? 'color-picker__contrast--warn'
                : 'color-picker__contrast--fail'
          }`}
          title={`Contrast against ${contrastAgainst}`}
        >
          {ratio.toFixed(2)}:1 {passesAA ? 'AA' : passesAALarge ? 'AA Large' : 'Fail'}
        </span>
      ) : null}
    </div>
  );
}
