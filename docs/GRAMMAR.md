# stackdeck Markdown Grammar (v2.0)

This document is the authoritative spec for the markdown syntax that produces a stackdeck deck. The parser, the inference engine, the editor's `/` palette, and the documentation site all derive from this file.

The mental model is small:

1. A deck is one markdown file plus a theme reference.
2. The file is split into slides by `::slide`.
3. Inside each slide, plain markdown is allowed and gets inferred into atomic blocks.
4. Pattern directives like `::callout` give explicit semantic intent.
5. Layout directives like `::columns` arrange blocks into shapes.
6. Directives describe **intent**, never form. Visual treatment is owned by the theme.

---

## 1. Document structure

```
---
title: Q4 Review
---

::cover
# Q4 Review
A look at the year that was.

::slide

# Highlights

- Revenue up 47%
- 12 new markets
- NPS at 71

::slide

::stats
::stat{value="$3M" label="ARR"}
::stat{value="47%" label="MoM Growth"}
::stat{value="71" label="NPS"}
::

::slide

::callout
This was a transformational quarter for the team.
::
```

### 1.1 Frontmatter

Optional YAML at the start of the file, fenced by `---`. Recognized fields:

| Field         | Type   | Purpose                                      |
| ------------- | ------ | -------------------------------------------- |
| `title`       | string | Deck title. Defaults to first H1 if missing. |
| `description` | string | Optional summary, used for sharing meta.     |
| `theme`       | object | Inline theme override (see section 6.2).     |

Frontmatter is parsed but never rendered as a slide.

### 1.2 Slide separator

`::slide` on its own line marks the start of a new slide. The first slide does not require a preceding `::slide`.

```
# This is slide 1

::slide

# This is slide 2
```

A `::slide` directive may carry slide-level options:

```
::slide{layout=hero}
::slide{notes="Speaker notes here"}
::slide{nosplit}        # forbid auto-split on overflow
```

Recognized options:

| Option    | Value           | Effect                                                                      |
| --------- | --------------- | --------------------------------------------------------------------------- |
| `layout`  | a LayoutId      | Forces a specific layout for this slide, overriding inference.              |
| `notes`   | quoted string   | Speaker notes, never rendered on the slide itself.                          |
| `nosplit` | flag (no value) | Forbids auto-split if content overflows. Slide may clip; user accepts that. |

---

## 2. Atomic primitives (9)

These are the only blocks the renderer understands. Pattern directives compile into trees of these.

### 2.1 Heading

```
# Title           -> { type: "heading", level: 1, text: "Title" }
## Subtitle       -> { type: "heading", level: 2, text: "Subtitle" }
### Section       -> level: 3
#### Detail       -> level: 4
```

Levels 5 and 6 are downgraded to level 4. Inline markdown (`**bold**`, `*italic*`, `` `code` ``, `[link](url)`) is preserved in the `text` field and rendered by the inline renderer.

### 2.2 Text

A paragraph in markdown becomes a `text` block.

```
Lorem ipsum dolor sit amet.   -> { type: "text", text: "...", emphasis: "normal" }
```

Emphasis variants:

```
::lead
The opening promise of this section.
::

::caption
A small caption.
::
```

Compile to `{ type: "text", emphasis: "lead" | "caption", text: "..." }`.

### 2.3 List

Standard markdown lists.

```
- One
- Two
  - Two-A
  - Two-B
- Three

1. First
2. Second
```

Compiles to a `list` block with `ordered` reflecting `1.` vs `-`. Nesting is preserved.

### 2.4 Quote

Markdown blockquote, optionally with attribution after a `--` separator on its own line.

```
> Make it work, make it right, make it fast.
> -- Kent Beck
```

Compiles to `{ type: "quote", text: "...", attribution: "Kent Beck", emphasis: "normal" }`. See `::quote.big` (section 3.7) for the takeover variant.

### 2.5 Stat

A single big-number block, used inside `::stats` / `::kpis` or as a standalone slide.

```
::stat{value="$3M" label="ARR"}
::stat{value="47%" label="MoM" delta="+12%" trend="up"}
```

Compiles to `{ type: "stat", value, label?, delta?, trend? }`.

### 2.6 Box

Generic container with optional semantic tone. Holds children blocks.

```
::box{tone=info}
Important secondary note.
::

::box{tone=warn}
Heads up about a risk.
::
```

Tones: `info`, `warn`, `success`, `neutral`. Theme decides visual treatment.

### 2.7 Columns

Explicit horizontal arrangement.

```
::columns{count=2}
:::
First column content.
:::
Second column content.
:::
::
```

Each `:::` starts a new column. Compiles to `{ type: "columns", count: 2|3, columns: [Block[], Block[]] }`.

### 2.8 Grid

```
::grid{cols=2 rows=2}
Top-left content.

Top-right content.

Bottom-left content.

Bottom-right content.
::
```

Children are placed left-to-right, top-to-bottom into the grid. Compiles to `{ type: "grid", cols, rows, children: Block[] }`.

### 2.9 Code

Standard markdown fenced code block.

````
```ts
const x: number = 1;
```
````

Compiles to `{ type: "code", language: "ts", content: "..." }`.

---

## 3. Pattern directives (10)

Patterns are sugar. The parser expands them into trees of atomic primitives. The renderer never sees the pattern name. Adding a pattern is a parser-only change.

### 3.1 `::cover`

Deck cover. Only meaningful on slide 1; ignored elsewhere by the deck planner.

```
::cover
# Big Title
A subtitle that frames the deck.
::
```

Expands to a `cover` layout containing `Heading.h1` + `Text.lead`.

### 3.2 `::section`

Section break, used between major parts of the deck.

```
::section
# Part Two: Where We're Going
::
```

Expands to a `section` layout containing `Heading.h1`.

### 3.3 `::callout`

Aside or important note.

```
::callout{tone=info}
This is the most important takeaway.
::
```

Expands to `Box{tone}` containing the inner blocks. Tone defaults to `neutral`.

### 3.4 `::compare`

Two-sided comparison: before/after, this/that, problem/solution.

```
::compare
:::
**Before**
The old way was slow and error-prone.
:::
**After**
The new way is faster and safer.
:::
::
```

Expands to a `split` layout containing two columns, each with the content given.

### 3.5 `::stats`

Row of 2 to 6 stats. Auto-arranges into the right grid.

```
::stats
::stat{value="42%" label="Lift"}
::stat{value="$3M" label="ARR"}
::stat{value="71"  label="NPS"}
::
```

Expands to a `grid` layout sized to fit (e.g. 3 stats -> grid 3x1).

### 3.6 `::kpis`

Larger grid (4 to 8 stats), arranged 2x2, 3x2, or 2x3.

```
::kpis
::stat{value="$3M" label="ARR"}
::stat{value="47%" label="MoM"}
::stat{value="71"  label="NPS"}
::stat{value="12"  label="Markets"}
::
```

Expands to a `grid` layout. Parser picks rows/cols based on count.

### 3.7 `::quote.big`

Full-bleed takeover quote.

```
::quote.big
> The future is already here, it's just not evenly distributed.
> -- William Gibson
::
```

Expands to a `fullBleed` layout containing `Quote{emphasis: "big"}`.

### 3.8 `::steps`

Ordered procedural list with step formatting.

```
::steps
1. Define the problem.
2. Sketch a solution.
3. Build the smallest version.
4. Ship and learn.
::
```

Expands to `List{ordered: true}` inside a `flow` layout, with the renderer treating items as steps via theme.

### 3.9 `::timeline`

Time-anchored sequence.

```
::timeline
- **2021** -- Founded.
- **2022** -- First product launch.
- **2023** -- Series A.
- **2024** -- Profitability.
::
```

Each item is parsed as `**when** -- body`. Expands to a `flow` layout containing a structured List the theme renders as a timeline.

### 3.10 `::agenda`

Deck table of contents.

```
::agenda
- Why we're here
- What we shipped
- What's next
- Q&A
::
```

Expands to a `flow` layout with `Heading.h2 ("Agenda")` + `List` styled by the theme.

---

## 4. Layouts (8)

Layouts are JSON files at `src/layouts/<id>.layout.json`. Each defines a CSS grid with named slots that blocks fill.

| LayoutId    | Purpose                                                          |
| ----------- | ---------------------------------------------------------------- |
| `flow`      | Top-to-bottom stack. Default fallback when inference is unsure.  |
| `hero`      | One dominant block, optional supporting content beneath.         |
| `cover`     | Deck cover treatment. Big title, subtitle, generous spacing.     |
| `section`   | Section break. Sparse, big, transition slide between deck parts. |
| `split`     | Two-column 50/50. Used by `::compare`.                           |
| `columns`   | Explicit N-column grid (2 or 3). Used by `::columns`.            |
| `grid`      | Explicit N x M grid. Used by `::stats`, `::kpis`, `::grid`.      |
| `fullBleed` | Single dominant element edge-to-edge. Used by `::quote.big`.     |

A layout may declare `supportedRatios`. v1 only ships `16:9`, so this is informational.

---

## 5. Inference

When a slide has no `layout=` option and no pattern directive, the inference engine picks a layout and arranges blocks. Three passes run in order.

### 5.1 Local pass

Score each candidate layout against the slide's blocks independently.

| Heuristic                                        | Suggests    |
| ------------------------------------------------ | ----------- |
| Single Heading.h1, sparse content, position 0    | `cover`     |
| Single Heading.h1 or h2, no body, not position 0 | `section`   |
| One Stat block alone                             | `hero`      |
| 2 to 6 Stat blocks                               | `grid`      |
| One Quote block alone                            | `fullBleed` |
| Heading + List or Heading + Text                 | `flow`      |
| Anything else                                    | `flow`      |

### 5.2 Deck pass (planner)

After every slide has a candidate, the planner adjusts based on deck-level rules:

- Slide 0 must use `cover` if any cover-shaped candidate exists.
- No two adjacent slides may share the same uncommon layout (avoid two `fullBleed` in a row).
- A slide tagged `::section` keeps `section` regardless of content.
- A slide carrying a pattern directive keeps its directive's layout.

### 5.3 Theme pass

The active Style may declare layouts it cannot render well. The planner substitutes a fallback. v1 themes all support all layouts; this pass is reserved for future theme-specific overrides.

---

## 6. Theme reference

A deck carries a `theme` object referring to a Style + Palette + Density + Mode. None of these affect the markdown source. Switching theme re-renders the same IR with different tokens.

### 6.1 Theme on a deck

```
deck.theme = {
  styleId: "editorial",
  paletteId: "electric-blue",
  density: "comfortable",       // dense | comfortable | airy | spacious
  mode: "light"                 // light | dark
}
```

### 6.2 Inline theme override (frontmatter)

```
---
title: My Deck
theme:
  styleId: brutalist
  paletteId: monochrome
  density: dense
  mode: dark
---
```

Inline overrides are convenience for authors. The persisted deck record is the source of truth.

---

## 7. Overflow behavior

A slide whose blocks exceed the available 16:9 area under the active theme + density gets auto-split into two slides at a sensible boundary (between top-level blocks). The editor surfaces a chip:

> "Slide 4 overflowed under Airy density, split into 4a and 4b. Switch to Comfortable to keep as one."

Authors can opt out per slide with `::slide{nosplit}`. The slide may clip; the author accepts that.

---

## 8. Print

Every slide must render correctly when the user invokes "Save as PDF" via the browser print dialog. The print stylesheet is part of the theme contract. Authors of new themes are responsible for testing print output across all 10 atomic primitives, both modes, and all 4 densities.

Animations, transitions, and `position: sticky` are disabled in print. Custom fonts are preloaded with `font-display: block` before print fires. The `@page` rule sets a 1280x720 page size with zero margins, producing exact 16:9 PDF pages.

---

## 9. Examples

### 9.1 Minimal deck

```
::cover
# Hello

::slide

# What we'll cover
- The problem
- The solution
- The result

::slide

::stats
::stat{value="$3M" label="ARR"}
::stat{value="47%" label="Growth"}
::stat{value="71"  label="NPS"}
::

::slide

::quote.big
> Beautiful is better than ugly.
> -- Tim Peters
```

### 9.2 Compare slide

```
::slide

::compare
:::
**Before**

The pipeline took 12 minutes and failed 8% of runs.
:::
**After**

The new pipeline runs in 2 minutes with a 0.4% failure rate.
:::
::
```

### 9.3 Mixed columns

```
::slide

# Why now

::columns{count=2}
:::
::callout{tone=info}
The cost of waiting compounds.
::
:::
::stat{value="$1M" label="Annual cost of inaction"}
:::
::
```

---

## 10. What's NOT in v1

The following are deliberate omissions, listed so authors and theme designers know what to expect.

- **Images.** No image upload, no image directive. v1 is text-only.
- **Charts.** Deferred. Will arrive as a separate atomic primitive in v1.5+.
- **Tables.** Use `::columns` or `::grid` for v1; native table primitive comes later.
- **Math.** No LaTeX rendering in v1.
- **Multiple aspect ratios.** Only 16:9.
- **User-uploaded fonts.** Top 10 Google Fonts, self-hosted, are the v1 set.
- **Live share links.** Sharing in v1 is via .deck file export or PDF.
