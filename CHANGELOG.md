# Changelog

All notable changes to stackdeck are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
