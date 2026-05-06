# Changelog

All notable changes to stackdeck are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Brand kit**: deck-level brand controls — name, logo URL (with optional dark-mode variant), logo position, brand-color override, accent-color override. Logo renders as an absolutely positioned overlay with five placement options.
- **Editorial** Style: serif display + sans body, magazine-grade typography, generous whitespace.
- **Brutalist** Style: Space Grotesk display, sharp edges, hard shadows, ALL CAPS section headers, accent-block overrides.
- **Three-pane editor shell**: slide thumbnails (left), markdown source (center), live preview (right), theme drawer (right slide-in).
- **Theme drawer** with two tabs (Theme / Brand): Style cards, Palette swatches, Density and Mode segmented controls; Brand fields including a hex/native color picker with live WCAG contrast badges.
- **OKLCH color math** helpers (`src/lib/color.ts`): perceptual lightness shifts, complementary accent derivation, WCAG contrast checks. `pnpm test` covers them.
- **`/templates` gallery page**: 12 curated theme presets, each rendered as a live mini-preview card. Click to apply and return to the editor.
- **Slide thumbnail navigation**: clickable mini-renders in the left sidebar; click to scroll to the slide in the preview.
- **Theme persistence**: last-used Style + Palette + Density + Mode auto-saved to localStorage and restored on next visit.
- **Premium block + layout CSS**: redesigned headings, lists, quotes, stat cards (with delta arrows and tinted gradients), cover slide gradients, section dividers with em-dash prefixes, fullBleed gradient backgrounds, big-quote takeover treatment.

### Changed

- Cover slides now use a radial gradient background tied to the brand color.
- `/` is the editor; the old single-row toolbar is replaced with a topbar plus the three-pane shell.
- Theme resolver now accepts an optional `Brand` argument and applies brand color overrides on top of the active palette.

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
