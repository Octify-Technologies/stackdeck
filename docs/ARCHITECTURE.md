# Architecture

This document explains how stackdeck turns a markdown file into a rendered slide deck. It is the design contract; if you change something here, the code should follow, and vice versa.

## Top-level data flow

```
┌──────────────┐    parse     ┌──────────────┐    plan     ┌──────────────┐
│              │ ───────────▶ │              │ ──────────▶ │              │
│  Markdown    │              │   Deck IR    │             │  Planned IR  │
│  (.md file)  │              │  (validated) │             │  (validated) │
│              │              │              │             │              │
└──────────────┘              └──────────────┘             └──────────────┘
                                                                  │
                                                                  │ render
                                                                  ▼
                                              ┌──────────────────────────────┐
                                              │  ThemeProvider               │
                                              │  ┌────────────────────────┐  │
                                              │  │  DeckRenderer          │  │
                                              │  │  ┌──────────────────┐  │  │
                                              │  │  │  SlideRenderer   │  │  │
                                              │  │  │  ┌────────────┐  │  │  │
                                              │  │  │  │ BlockRender│  │  │  │
                                              │  │  │  └────────────┘  │  │  │
                                              │  │  └──────────────────┘  │  │
                                              │  └────────────────────────┘  │
                                              └──────────────────────────────┘
                                                              │
                                                              │ window.print()
                                                              ▼
                                                       ┌──────────────┐
                                                       │   PDF file   │
                                                       └──────────────┘
```

Five stages, four data shapes. Each stage is pure: same input, same output. Only the editor and the browser print pipeline have side effects.

## The IR

The IR (intermediate representation) is the contract between every part of the system. Defined in [src/ir/schema.ts](../src/ir/schema.ts), validated by Zod, type-inferred for TypeScript.

```
Deck
├── version           "2.0"
├── id                ULID
├── title
├── aspectRatio       "16:9"
├── theme             ThemeRef
├── slides[]          Slide
├── createdAt
└── updatedAt

Slide
├── id                ULID
├── layout            LayoutId  (one of 8)
├── blocks[]          Block     (one of 9 atomic types)
└── notes?            string

Block (discriminated union, 9 variants)
├── heading           { level: 1..4, text }
├── text              { emphasis: normal|lead|caption, text }
├── list              { ordered, items[] }    (recursive)
├── quote             { emphasis: normal|big, text, attribution? }
├── stat              { value, label?, delta?, trend? }
├── code              { language?, content }
├── box               { tone?, children: Block[] }    (recursive)
├── columns           { count: 2|3, columns: Block[][] }    (recursive)
└── grid              { cols, rows, children: Block[] }    (recursive)
```

The recursive container blocks (Box, Columns, Grid) hold child blocks, making the IR a tree, not a flat list. This is what makes "put a box inside a column inside a slide" work cleanly.

## The grammar layer (parser)

[src/ir/parse.ts](../src/ir/parse.ts) is a single-pass line-tokenizer plus a recursive descent parser.

```
markdown source
       │
       ▼
┌─────────────────────────┐
│  1. Frontmatter split   │  gray-matter splits YAML frontmatter from body
└─────────────────────────┘
       │
       ▼
┌─────────────────────────┐
│  2. Slide section split │  split body on `::slide` lines into N sections
└─────────────────────────┘
       │
       ▼
┌─────────────────────────┐
│  3. Per-slide tokenize  │  classify each line: open / close / colsep / void / text
└─────────────────────────┘
       │
       ▼
┌─────────────────────────┐
│  4. Recursive parse     │  expand directives, accumulate text into markdown chunks
└─────────────────────────┘
       │
       ▼
┌─────────────────────────┐
│  5. Pattern expansion   │  ::callout → Box{tone}, ::compare → Columns{2}, etc.
└─────────────────────────┘
       │
       ▼
┌─────────────────────────┐
│  6. Markdown → blocks   │  marked.lexer for plain-md regions, mapped to Heading/Text/List/Quote/Code
└─────────────────────────┘
       │
       ▼
┌─────────────────────────┐
│  7. Layout selection    │  explicit > pattern > inferred
└─────────────────────────┘
       │
       ▼
┌─────────────────────────┐
│  8. Schema validation   │  Zod safeParse on the whole Deck
└─────────────────────────┘
       │
       ▼
   Deck IR
```

**The discipline:** the renderer never sees pattern names like `callout` or `compare`. They are compiled away in stage 5. The IR contains only the 9 atomic block types. Adding a new pattern is a parser-only change with zero impact on the renderer or themes.

## The planner (deck-level pass)

[src/ir/plan.ts](../src/ir/plan.ts) runs after the parser produces a per-slide IR. It enforces deck-level rules that local parsing cannot:

| Rule                                                                     | Effect                               |
| ------------------------------------------------------------------------ | ------------------------------------ |
| Slide 0 with single H1 and sparse content gets `cover` layout            | Even if user did not write `::cover` |
| Slide 0 tagged `cover` but content is too dense gets demoted to `flow`   | Honest fallback                      |
| Mid-deck `cover` layout becomes `section` if it is heading-only          | Cover only belongs at slide 0        |
| Two adjacent slides with the same uncommon layout: second becomes `flow` | Avoid two `fullBleed` in a row       |

Inference is local; planning is global. Both produce the same `Deck` shape so the renderer never knows which path made each decision.

## The theme system

A theme is composed at runtime from four orthogonal axes:

```
Theme  =  Style  ×  Density  ×  Palette  ×  Mode

Style    typography, radius, shadow, motion, base spacing, color sets (light + dark)
Density  multiplier on the spacing scale: dense 0.75, comfortable 1.0, airy 1.35, spacious 1.7
Palette  brand + accent + optional surface/text overrides
Mode     light or dark
```

The theme resolver ([src/render/theme-resolver.ts](../src/render/theme-resolver.ts)) is a pure function:

```
resolveTheme(themeRef, style, palette) ->
  {
    colors:   { brand, accent, surface, surface-muted, text, text-muted, border, success, warn, danger }
    cssVars:  { --color-brand, --space-md, --radius-lg, --font-display, --shadow-md, ... }
  }
```

The `cssVars` map is applied as inline `style` on a `.deck-root` element by `ThemeProvider`. Switching theme is a single CSS variable swap, ~40 properties. No React reconciliation. Sub-frame on a 100-slide deck.

```
┌──────────────────────────────────────────────────────────────┐
│  <html style="--font-inter: ...">                            │
│    <body>                                                    │
│      <div class="deck-root"                                  │
│           data-mode="light" data-density="comfortable"       │
│           style="                                            │
│             --color-brand: #2563eb;                          │
│             --color-surface: #ffffff;                        │
│             --space-md: 8px;                                 │
│             --font-display: var(--font-inter), ...;          │
│             ... (~40 vars total)                             │
│           ">                                                 │
│        <div class="deck">                                    │
│          <div class="slide-frame">                           │
│            <section class="slide layout-cover">              │
│              <h1 class="block block-heading block-h1">       │
│                Title                                         │
│              </h1>                                           │
│              <!-- All blocks read CSS variables only -->     │
│            </section>                                        │
│          </div>                                              │
│          ...                                                 │
│        </div>                                                │
│      </div>                                                  │
│    </body>                                                   │
│  </html>                                                     │
└──────────────────────────────────────────────────────────────┘
```

**The discipline:** atomic block components consume CSS variables only. They never reference hardcoded hex colors, pixel spacing, or font families. This is what makes adding a new theme a token-file change with zero component edits.

## The renderer

```
DeckRenderer
  └── ThemeProvider (injects CSS vars)
        └── div.deck
              └── for each Slide:
                    └── div.slide-frame (16:9 box)
                          └── SlideRenderer
                                └── section.slide.layout-{id}
                                      └── for each Block:
                                            └── BlockRenderer (dispatches by type)
                                                  └── Heading | Text | List | Quote | Stat | Code | Box | Columns | Grid
```

The dispatcher in [src/blocks/BlockRenderer.tsx](../src/blocks/BlockRenderer.tsx) is exhaustive: TypeScript enforces a `case` for every block type. Adding a new atomic block is a compile-time error until you handle it in the dispatcher.

## The storage layer

v0.1 stores the source markdown and theme reference in React state only. It does not persist across reloads. v0.2 will add IndexedDB persistence with auto-save and version history. The persistence module will be `src/storage/`, isolated from the IR and rendering layers.

## PDF export

A single button calls `window.print()`. The print stylesheet (in [src/styles/deck.css](../src/styles/deck.css)) does the work:

```css
@page {
  size: 1280px 720px; /* Exact 16:9 */
  margin: 0;
}

@media print {
  .slide-frame {
    width: 1280px;
    height: 720px;
    page-break-after: always;
  }
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

Modern Chrome's print pipeline produces vector text, embeds custom fonts, and respects CSS gradients. The output is a real PDF, not a screenshot. No serverless function needed.

The honest tradeoffs:

- The user sees the browser's native print dialog, not a stackdeck-branded one.
- Some browsers (older Safari) handle web fonts differently in print.
- Animations and `position: sticky` are disabled in print by the global rules above.

## Module boundaries

```
                   ┌─────────────────┐
                   │   src/ir/       │  pure logic, no React, no DOM
                   │   schema.ts     │
                   │   parse.ts      │
                   │   plan.ts       │
                   └────────┬────────┘
                            │ (Block, Deck, Slide types)
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
  ┌──────────┐       ┌──────────────┐    ┌─────────────┐
  │  blocks/ │       │  layouts/    │    │   themes/   │
  │  9 React │       │  8 grid defs │    │  Style+Pal  │
  │  comp.   │       │  + CSS       │    │  registry   │
  └─────┬────┘       └──────┬───────┘    └──────┬──────┘
        │                   │                   │
        └─────────┬─────────┴───────────────────┘
                  │
                  ▼
            ┌──────────┐
            │  render/ │  ThemeProvider, DeckRenderer, SlideRenderer, ExportPdf
            └─────┬────┘
                  │
                  ▼
            ┌──────────┐
            │  editor/ │  the UI shell
            └─────┬────┘
                  │
                  ▼
            ┌──────────┐
            │   app/   │  Next.js routes
            └──────────┘
```

Dependencies only flow downward. `ir/` knows nothing about React. `blocks/` and `themes/` only depend on IR types. `render/` orchestrates. `editor/` is the only place state lives. `app/` is just the Next.js mounting points.

## Testing strategy

Deterministic logic gets unit tests. UI gets reviewed by humans.

| Layer            | Tested? | How                                             |
| ---------------- | ------- | ----------------------------------------------- |
| `ir/schema.ts`   | Yes     | Validators accept good shapes, reject bad ones  |
| `ir/parse.ts`    | Yes     | Each directive, each pattern, full 7-slide e2e  |
| `ir/plan.ts`     | Yes     | Each rule in isolation                          |
| `theme-resolver` | Yes     | Color overrides, density scaling, mode swap     |
| Block components | No      | Visual review                                   |
| Editor UI        | No      | Visual review                                   |
| Print stylesheet | No      | Manual PDF export check before each Style ships |

Coverage thresholds (in [vitest.config.ts](../vitest.config.ts)) are enforced on `src/ir/` and `src/render/theme-resolver.ts`: 75% lines, 75% functions, 70% branches, 75% statements.

## What this architecture buys you

- **One source, many themes.** Same markdown file, switch theme, get a different look without touching the source.
- **Cheap theme authoring.** A new Style is one TypeScript file in [src/themes/styles/](../src/themes/styles/). Zero changes elsewhere.
- **Cheap pattern authoring.** A new directive is one branch in the parser's pattern expander. Zero changes elsewhere.
- **Print fidelity.** PDF is a real PDF, not a screenshot.
- **No backend.** Pure static deploy.
- **No lock-in.** Markdown is forever readable, the IR schema is documented, the grammar is versioned.

## What this architecture deliberately defers

- Images (planned v0.5)
- Charts and tables (planned v0.6)
- Multiple aspect ratios (16:9 only in v0.x)
- Real-time multiplayer (out of scope; single-user product)
- A backend (out of scope; the no-backend constraint is a feature)

## Where to look first

| You want to                      | Start here                                                                                                                        |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Understand the IR                | [src/ir/schema.ts](../src/ir/schema.ts)                                                                                           |
| Add a markdown directive         | [src/ir/parse.ts](../src/ir/parse.ts) `expandBlockDirective`                                                                      |
| Add a layout                     | [src/layouts/index.ts](../src/layouts/index.ts) + [src/styles/layouts.css](../src/styles/layouts.css)                             |
| Add a Style or Palette           | [src/themes/styles/](../src/themes/styles/) + [src/themes/registry.ts](../src/themes/registry.ts)                                 |
| Tune block visuals               | [src/blocks/](../src/blocks/) + [src/styles/blocks.css](../src/styles/blocks.css)                                                 |
| Change theme switching mechanics | [src/render/theme-resolver.ts](../src/render/theme-resolver.ts) + [src/render/ThemeProvider.tsx](../src/render/ThemeProvider.tsx) |
| Improve PDF output               | [src/styles/deck.css](../src/styles/deck.css) `@media print`                                                                      |
