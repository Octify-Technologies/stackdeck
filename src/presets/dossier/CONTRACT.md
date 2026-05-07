# Dossier preset — design contract

This contract is binding for every Tier 1 slide composition and every CSS rule that
ships under `[data-preset='dossier']`. The goal: nine slides that read as one
publication.

If a layout doesn't fit within these tokens, redesign the layout inside the constraints.
Never invent new type sizes, spacing values, or colors. Use the CSS variables defined
in `src/styles/dossier.css` (the `--d-*` tokens).

## Canvas

- 1280 × 720 (16:9). All px values reference this scale.
- Outer margins: `--d-mx` (64px) left/right, `--d-my-top` (28px) top, `--d-my-bot` (24px) bottom.
- Spine rail (body slides only): 28px wide column at x=20–48px; content area starts at `var(--d-content-x)` (92px).
- Tier 1 slides without a spine (cover, closer, section divider) start content at `--d-mx` (64px).
- Content top baseline (body slides): y=102px. Bottom baseline: y=656px.

## Grid

- 12 columns. Column = 76.7px. Gutter 24px.
- Use 4/8 or 6/6 splits. Never 5/7.

## Baseline

- 8px. Pick spacing from `--d-s1`(8) `--d-s2`(16) `--d-s3`(24) `--d-s4`(40) `--d-s5`(64). Never invent intermediate values.
- 4px is allowed only for label→value internal gaps inside a single component.

## Color (use only these for type)

| Token                   | Value   | Reserved for                                                                    |
| ----------------------- | ------- | ------------------------------------------------------------------------------- |
| `--color-text`          | #F2EDE2 | body, titles, primary numerals                                                  |
| `--color-text-muted`    | #9A9384 | secondary prose, muted leaders                                                  |
| `--color-brand`         | #C8A24A | mono kicker labels, brass marks, kpi positive deltas, accent rules              |
| `--color-accent`        | #C8492C | NEGATIVE deltas only, rubber stamps, the closer's "Fin." mark, "Verified" stamp |
| `--color-border`        | #2A2723 | hairlines                                                                       |
| `--color-surface-muted` | #15130F | code blocks, outlined section numeral fill                                      |

Oxblood is a precision instrument. Do not use it for accents, headings, or decoration.

## Type scale

Display (Fraunces ITALIC, weight 400, tracking `--d-tr-display` -0.022em unless noted):

| Var                  | Size/lh  | Used by                                  |
| -------------------- | -------- | ---------------------------------------- |
| `--d-D1`/`--d-lh-D1` | 168/0.92 | Closer's "Thank you."                    |
| `--d-D2`/`--d-lh-D2` | 128/0.94 | Cover primary title                      |
| `--d-D3`/`--d-lh-D3` | 96/0.98  | Section divider title                    |
| `--d-D4`/`--d-lh-D4` | 72/1.02  | Tier 1 figure heading, h1 on body slides |
| `--d-D5`/`--d-lh-D5` | 56/1.06  | Tear-sheet outcome, secondary title      |
| `--d-D6`/`--d-lh-D6` | 40/1.10  | Pull-quote attribution name, h2-bold     |
| `--d-D7`/`--d-lh-D7` | 28/1.20  | Tear-sheet field value, h3               |

Display ROMAN:

| Var            | Used by                             |
| -------------- | ----------------------------------- |
| `--d-DR1` 80px | Cover sub-line (roman counterpoint) |
| `--d-DR2` 32px | Roman H2 on body slides             |

Body (Fraunces ROMAN):

| Var              | Used by                   |
| ---------------- | ------------------------- |
| `--d-B1` 20/1.55 | Lead paragraph            |
| `--d-B2` 17/1.60 | Default body              |
| `--d-B3` 14/1.50 | Small body / sidebar copy |

Mono (JetBrains, ALL CAPS, font-weight 600, tracked):

| Var           | Tracking           | Used by                             |
| ------------- | ------------------ | ----------------------------------- |
| `--d-M1` 12px | `--d-tr-M1` 0.24em | Figure header label, primary kicker |
| `--d-M2` 11px | `--d-tr-M2` 0.26em | Running head, leader label          |
| `--d-M3` 10px | `--d-tr-M3` 0.32em | Stamp text, masthead cells          |
| `--d-M4` 9px  | `--d-tr-M4` 0.32em | Folio, micro-meta                   |

Numerals (display, italic):

| Var                                                    | Used by                         |
| ------------------------------------------------------ | ------------------------------- |
| `--d-N1` 320px / 0.85                                  | Hero stat single value          |
| `--d-N2` 240px                                         | Cover watermark                 |
| `--d-N3` 384px stroked, transparent fill, 1.5px stroke | Section outline numeral         |
| `--d-N4` 72px                                          | KPI cell value                  |
| `--d-N5` 104px                                         | Before/after value              |
| `--d-N6` 24px brand color                              | Ordered-list / finding numerals |

Units inside numerals (`$`, `%`, `M`, `pts`): 55% of base size, italic, brand color, vertical-align 0.22em.

## Hairlines

- 1px solid `var(--color-border)`.
- 2px reserved for: tear-sheet outcome left rule (brass), KPI grid header divider (brass), closer FIN border (oxblood). Nothing else.

## Dotted leaders

- `radial-gradient(circle, var(--color-text-muted) 0.6px, transparent 0.6px)` at 6px×1px repeat-x, opacity 0.5. Standard.

## Chrome on body slides (every Tier 1 except cover/section/closer)

- `.dossier-runhead` at top: 28px from top, hairline below at 12px gap.
- `.dossier-spine` at left margin: vertical mono rotated -90°, brass for chapter prefix only.
- `.dossier-folio` at bottom-right: hairline (18px wide) before mono M4.

The `BodyFrame` component already implements all three. Use it.

## Layering (z-index)

| z   | Element                                               |
| --- | ----------------------------------------------------- |
| 1   | watermarks, decorative outline numerals, paper grain  |
| 2   | main content (titles, body, charts)                   |
| 3   | secondary content (kickers, dotted leaders, sidebars) |
| 4   | chrome (running head, spine, folio)                   |
| 5   | stamps (always on top)                                |

## Forbidden

- Drop shadows, gradients, rounded corners (>0px) anywhere except the Quote avatar circle.
- Hover states on slides (they are presentation surfaces).
- Em dashes — anywhere, including comments.
- Mixing type sizes outside the scale above.
- Spacing values outside the rhythm set.
- Oxblood used for anything other than the three reserved cases.
