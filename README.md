<div align="center">

# stackdeck

**Turn a markdown file into a beautiful slide deck.**
**Switch themes instantly. Export to PDF. No backend, no accounts, no lock-in.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![CI](https://github.com/Octify-Technologies/stackdeck/actions/workflows/ci.yml/badge.svg)](https://github.com/Octify-Technologies/stackdeck/actions/workflows/ci.yml)
[![Made with Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)](https://stackdeck-seven.vercel.app)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)

[Live demo](https://stackdeck-seven.vercel.app) · [Grammar reference](docs/GRAMMAR.md) · [Architecture](docs/ARCHITECTURE.md) · [Changelog](CHANGELOG.md)

</div>

---

## Why stackdeck

You write in markdown. The slides should follow.

Most slide tools force you into a visual editor, lock your content into proprietary formats, or hide your content behind a SaaS account. **stackdeck flips it.** Markdown is the source of truth. The same `.md` file renders under any theme, exports to PDF, and lives in your repo or on your disk forever.

<!-- prettier-ignore -->
```md
::cover
# Q4 Review
A look at the year that was.
::

::slide

::stats
::stat{value="$3M" label="ARR" delta="+47%" trend="up"}
::stat{value="71" label="NPS" delta="+9" trend="up"}
::stat{value="12" label="Markets" delta="+5" trend="up"}
::

::slide

::quote.big
> The future is already here, it is just not evenly distributed.
> -- William Gibson
::
```

That markdown becomes a 3-slide deck with a cover, a 3-stat grid, and a takeover quote. Switch the theme and it reflows in milliseconds.

## Features

- **Markdown-first.** Plain markdown plus a small set of semantic directives. No new programming language to learn.
- **Theme = Style × Density × Palette × Mode.** Tens of thousands of theme combinations from a small curated atom set.
- **Instant theme switching.** No re-render, no flicker. CSS variable swap on a deck root, sub-frame fast.
- **PDF export via the browser.** `window.print()` plus a careful print stylesheet. Vector text, custom fonts, exact 16:9 page geometry.
- **No backend.** Pure static deploy on Vercel, Cloudflare Pages, GitHub Pages, or anywhere static. Your content lives in your browser (or in a `.md` file you control).
- **Open standards.** TypeScript-strict, Zod-validated IR, semantic versioned grammar, no lock-in.
- **Single source of truth.** One markdown file, every theme, every render path.
- **Production-grade primitives.** 9 atomic blocks, 10 pattern directives, 8 layouts. Tree-shaped IR, exhaustive renderer.

## Quickstart

Requires Node 22 (see [.nvmrc](.nvmrc)) and pnpm 10+.

```bash
git clone https://github.com/Octify-Technologies/stackdeck.git
cd stackdeck
pnpm install
pnpm dev
```

Open `http://localhost:3000`. Edit the markdown on the left, watch the deck update on the right, switch themes from the toolbar, click **Export PDF** when you're ready.

## What it looks like

```
┌──────────────────────┬──────────────────────────────────┐
│  Markdown source     │  Live slide preview              │
│                      │                                  │
│  ::cover             │  ┌──────────────────────────┐    │
│  # Q4 Review         │  │                          │    │
│  ::                  │  │   Q4 Review              │    │
│                      │  │   A look at the year     │    │
│  ::slide             │  │   that was.              │    │
│                      │  │                          │    │
│  # Highlights        │  └──────────────────────────┘    │
│                      │                                  │
│  - Revenue up 47%    │  ┌──────────────────────────┐    │
│  - NPS at 71         │  │  Highlights              │    │
│                      │  │  • Revenue up 47%        │    │
│                      │  │  • NPS at 71             │    │
│                      │  └──────────────────────────┘    │
└──────────────────────┴──────────────────────────────────┘
        Toolbar:  Style ▾  Palette ▾  Density ▾  Mode ▾  Export PDF
```

## How it compares

|                             | stackdeck | Slidev     | Marp       | Pitch |
| --------------------------- | --------- | ---------- | ---------- | ----- |
| Markdown-first              | ✅        | ✅         | ✅         | ❌    |
| Instant theme switching     | ✅        | ⚠️ rebuild | ⚠️ rebuild | ✅    |
| Multi-theme from one source | ✅        | ⚠️ partial | ⚠️ partial | ❌    |
| Self-hosted                 | ✅        | ✅         | ✅         | ❌    |
| No backend required         | ✅        | ✅         | ✅         | ❌    |
| Browser PDF export          | ✅        | ⚠️ CLI     | ⚠️ CLI     | ✅    |
| TypeScript-strict source    | ✅        | ✅         | ⚠️         | n/a   |

## Architecture in one paragraph

A markdown file is parsed into a versioned IR (`Slide = { layout, blocks[] }`). Pattern directives like `::callout` and `::compare` compile to trees of 9 atomic block primitives. Inference picks a layout when the user does not specify one; a deck-level planner enforces position rules (cover at slide 0, no repeated section breaks). The renderer reads CSS variables emitted by the active theme (Style + Palette + Density + Mode), so theme switching is a CSS variable swap, not a React re-render. PDF export uses native `window.print()` with a 1280×720 `@page` rule.

Full deep-dive in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Grammar spec in [docs/GRAMMAR.md](docs/GRAMMAR.md).

## Project layout

```
src/
  ir/         markdown parser, deck planner, Zod schemas (the IR contract)
  blocks/     9 atomic React primitives, one file each, all token-driven
  layouts/    8 layout definitions (CSS grid + metadata)
  themes/     curated Styles + Palettes + registry
  render/     ThemeProvider, SlideRenderer, DeckRenderer, PDF export
  editor/     the live markdown editor with theme controls
  styles/     global CSS that consumes the theme tokens
  app/        Next.js routes
docs/
  GRAMMAR.md       authoritative markdown grammar spec
  ARCHITECTURE.md  system overview
tests/
  ir/         deterministic tests for schema, parse, plan
  render/     theme resolver tests
```

## Develop

```bash
pnpm dev              # start the editor on localhost:3000
pnpm typecheck        # tsc --noEmit
pnpm format           # prettier --write
pnpm format:check     # prettier --check (used by CI)
pnpm lint             # eslint
pnpm knip             # detect unused files, exports, dependencies
pnpm test             # vitest, single run
pnpm test:watch       # vitest, watch mode
pnpm test:coverage    # vitest with v8 coverage
pnpm build            # next build
```

CI runs typecheck, format-check, lint, knip, test, and build on every PR across Node 20 and 22.

## Roadmap

- [x] v0.1 — IR, parser, planner, theme system, 9 atomic blocks, 8 layouts, editor, PDF export
- [x] v0.2 — Brand kit, three-pane editor, templates gallery, Editorial + Brutalist Styles
- [x] v1.0 — Deck library at `/`, IndexedDB persistence with auto-save, `/d/[id]/edit` editor, Insert menu for directives, Soft Style, premium per-Style cover treatments
- [ ] v1.1 — CodeMirror editor with `/` directive palette and live syntax highlighting
- [ ] v1.2 — Image support (compressed-on-import, blob storage in IndexedDB)
- [ ] v1.3 — Charts and tables as native primitives
- [ ] v1.4 — Folders / collections; named brand profiles with logo + color presets
- [ ] v1.5 — Theme marketplace via static JSON registry, public stable grammar

## Contributing

PRs welcome. Please:

1. Open an issue describing the change before sending a large PR.
2. Keep IR changes covered by tests in [tests/ir/](tests/ir/). Adding a directive or layout means adding a test.
3. Theme additions: one new file in [src/themes/styles/](src/themes/styles/) plus a registry entry. No code changes elsewhere.
4. Run `pnpm typecheck && pnpm test && pnpm lint` before pushing.

The architectural boundary is firm: the renderer never sees pattern directives. They compile to atomic block trees in the parser. If your change wants to bend that rule, open an issue first.

## License

[MIT](LICENSE). Use it, fork it, ship it.

---

<div align="center">

If stackdeck saved you time, [drop a star ⭐](https://github.com/Octify-Technologies/stackdeck) — it helps others find the project.

</div>
