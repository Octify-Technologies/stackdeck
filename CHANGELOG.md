# Changelog

All notable changes to stackdeck are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] — v1.0 (in progress)

### Added — workspace and persistence

- **Deck library** at `/`: card-grid of all your decks with live thumbnails, last-edited timestamps, hover-revealed duplicate and delete actions, and a "New deck" CTA.
- **IndexedDB persistence**: every keystroke auto-saves your deck. Decks survive reloads, browser restarts, and device wipes (until you clear browser data).
- **Routing**: editor lives at `/d/[id]/edit`. Each deck has a clean shareable URL. `/d/[id]` redirects to the editor.
- **`/new` flow**: pick a template (or "Blank") to create a deck. The deck is initialized with starter content + the chosen theme, then routes to the editor.
- **Save indicator** in the editor topbar shows live save state ("Saving…", "Saved", or "Save failed").
- **Insert menu**: dropdown next to the Design button with 14 directive snippets (Slide, Cover, Section break, Stats row, KPI grid, Compare, 2/3 columns, 2x2 grid, Callout, Big quote, Bullet list, Numbered steps, Code block). Inserts at the cursor.

### Added — brand and theme controls

- **Brand kit**: deck-level brand controls — name, logo URL (with optional dark-mode variant), logo position, brand-color override, accent-color override. Logo renders as an absolutely positioned overlay with five placement options.
- **Theme drawer** with two tabs (Theme / Brand): Style cards, Palette swatches, Density and Mode segmented controls; Brand fields including a hex/native color picker with live WCAG contrast badges.
- **OKLCH color math** helpers in `src/lib/color.ts`: perceptual lightness shifts, complementary accent derivation, WCAG contrast checks.
- **Templates gallery** at `/templates`: 16 curated theme combinations as live mini-preview cards. Click to create a new deck with that theme.
- **Slide thumbnail navigation**: clickable mini-renders in the left sidebar; click to scroll to the slide in the preview.

### Added — Styles

- **Editorial**: serif display (Fraunces) + sans body (Inter), magazine-grade typography, generous whitespace, vertical hairline rule on cover.
- **Brutalist**: Space Grotesk heavy display, zero radii, hard offset shadows, ALL CAPS sections, accent-color slab on cover.
- **Soft**: pastel gradient backgrounds, friendly serif-meets-sans typography, generous radii, dreamy radial blob gradients on cover.

### Added — render polish

- **Per-Style cover treatments**: Modern (diagonal grid + brand-tinted corner), Editorial (vertical hairline rule, italic display), Brutalist (hard accent slab, ALL CAPS), Soft (radial blob gradients, italic serif).
- **Per-Style section dividers**: each Style has its own decorative bar.
- **Per-Style fullBleed treatments**: Brutalist paints the whole bleed in the accent color.
- **Slide page numbers**: subtle `01 / 12`-style numbering in monospace, on every slide except cover and full-bleed.
- **Stat cards** with brand-tinted gradient backdrops, delta arrow pills (`↗` `↘`), tabular numerals.
- **Lists** with brand-colored bullet dots; ordered lists with display-font leading-zero numerals.
- **Big quotes** with hanging quote glyph.
- **Cover layout** redesigned with eyebrow / title / lede composition.

### Changed

- `/` is now the deck library, not the editor.
- Theme resolver accepts an optional `Brand` argument and applies brand color overrides on top of the active palette.
- Theme resolver gained `--space-3xl` token; `--slide-padding` increased to 4.5x for a more generous default.
- `/templates` now creates a new deck on click instead of saving the theme to localStorage.
- IR schema gained an optional `brand` field on `Deck` (logo URL, position, brand and accent overrides).

### Removed

- `src/lib/storage.ts` (replaced by IndexedDB-backed `src/storage/`).

## [0.1.0] - 2026-05-06

Initial public release.

### Added

- Versioned IR (`v2.0`) with Zod-validated schemas: Deck, Slide, 9 atomic Blocks, Style, Palette, ThemeRef.
- Markdown parser supporting frontmatter, `::slide` separators, 10 pattern directives, void directives, and nested containers.
- Deck-level planner with cover-at-slide-0, mid-deck cover demotion, and uncommon-layout deduplication rules.
- Theme system composed from Style x Density x Palette x Mode. CSS-variable injection for instant theme switching with no React reconciliation.
- 9 atomic block React components, one file each, all token-driven.
- 8 layouts: flow, hero, cover, section, split, columns, grid, fullBleed.
- Modern Style + 4 curated Palettes (Electric, Sunset, Forest, Mono).
- Live editor at `/` with markdown source and rendered preview, plus theme toolbar.
- PDF export via `window.print()` and a 16:9 `@page` print stylesheet.
- Deterministic test suite: 40 tests across schema, parser, planner, and theme resolver.
- ESLint flat config, Prettier, Knip, TypeScript strict mode, Vitest with v8 coverage.
- GitHub Actions CI: typecheck, format-check, lint, knip, test, build on Node 20 and 22.
- Continuous deploys via Vercel git integration (production on `main`, preview on PRs).

[Unreleased]: https://github.com/Octify-Technologies/stackdeck/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Octify-Technologies/stackdeck/releases/tag/v0.1.0
