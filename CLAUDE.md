Never run build or tests until I ask manually.

## The mental model (read this first)

**A preset is a hand-designed deck that has been embedded into this app.** Not a theme. Not a CSS skin over a generic template. A complete, intentional, designer-grade slide deck whose compositions live in this repo as JSX and scoped CSS. The only difference from a one-off, hand-coded deck is that the _content_ is variable: it comes in as markdown directives instead of being baked into the JSX.

The bar is the same as the bar for a designer-built deck delivered to a client. Bloomberg Businessweek case studies. Stripe annual reports. Apple keynotes. That level. If a preset's output looks like a "templated theme", the preset is failing its job.

The reason this app exists is reuse: design a deck once, render it as many times as needed for as many clients as needed by swapping the markdown content. The design quality is fixed at preset-design time. The content is fluid.

## The product

The user experience is: pick a preset, drop your content in, it looks great, done. No customization panel, no grid editor, no layout options. The design quality is the product. The target user is content-rich and time-poor: consultants, agencies, founders. They should never have to make a visual decision. If you find yourself suggesting a customization option or a user-facing setting, stop. The preset should make that decision for them.

Every preset is its own different design. A future "Bauhaus" preset is not Dossier with different colors. It is its own designed deck with its own grammar, its own type personality, its own decorative atoms, its own bespoke compositions. Two completely different decks that both happen to consume the same markdown directive vocabulary.

## What a great preset must deliver

A real client case study has three tiers of slide content. A preset must hand-design Tier 1 and opinionate Tier 2 and 3.

### Tier 1, signature moments (where presets win or lose)

Roughly 9 slide types. Each is a bespoke composition: hand-tuned JSX with absolute positioning, exact type sizes, decorative atoms, art direction. Generic CSS does not produce these. Bespoke components do.

1. Cover. Project title, subhead, client, date, author. First impression.
2. Tear sheet. Client, industry, engagement, duration, team, outcome headline.
3. Section divider. Chapter number, italic oversized chapter title. Used 3 to 5 times in the deck.
4. Hero stat. The one number that matters. Fills 50 to 70 percent of the canvas.
5. KPI grid. 3 to 6 stats with deltas and trend arrows. Optional source caption.
6. Pull quote. Quote, attribution, optional photo. Full bleed. Decorative open-quote glyph.
7. Before / after. Two columns, transformation in one frame.
8. Chart slide. Title, chart, context line, source caption.
9. Closer. Thank you. Contact. Brand mark. Mirrors the cover.

### Tier 2, workhorse layouts (60 to 70 percent of slide count)

Body slides that carry the narrative between signature moments. CSS scoped to the active preset is enough. They should look professionally consistent, not generic.

Body (heading plus paragraph plus list). Two-column compare. Three-column principles. Process steps. Timeline. Deliverables. Image with caption. Annotated image. Logo strip. Data table. Agenda.

### Tier 3, inline blocks (atoms)

Headings (H1 to H4), paragraph, lead, caption, bulleted list, numbered list, inline stat, inline quote, code, callout (info / warn / success / neutral), inline table, inline chart, image (plain / framed / inline), hairline rule. Generic React components, preset CSS for tone.

## Vocabulary (lock these meanings)

A **deck** is the final artifact: a stored slide deck the user edits, presents, and exports. A deck is created by combining a **preset** with an optional **template**.

### Preset = the hand-designed deck

A Preset is the design surface. A complete deck design embedded as code in this repo. To deliver one, you ship:

- 9 signature compositions as bespoke JSX components, each typically 80 to 200 lines.
- Scoped CSS for the workhorse layouts and inline blocks, written under `[data-preset='<id>']` (or for a single-design app, in a single locked CSS file like `src/styles/dossier.css`).
- Decorative atoms the design uses (SVG monograms, hairlines, glyphs).
- A curated demo template chosen to flatter the preset's specific compositions.
- A palette and a default font.

Adding a new design means designing a new deck end to end. There is no shortcut where generic CSS produces editorial results. The cost of a serious preset is roughly a designer-week.

The current app ships one design (`src/styles/dossier.css`) and exposes it as multiple `Preset` records that vary palette and font over that locked design. That is a legitimate cheap-reuse path for _variations of the same designed deck_ (Dossier Noir vs Dossier Midnight). It is not a substitute for adding a _new design_. A new design = a new CSS file (e.g. `src/styles/bauhaus.css`), possibly new bespoke JSX components, a new curated demo template.

Type and registry: [src/app/presets/presets.ts](src/app/presets/presets.ts). Color tokens: [src/themes/palettes/](src/themes/palettes/). Fonts: [src/themes/fonts.ts](src/themes/fonts.ts). Resolver: [src/render/theme-resolver.ts](src/render/theme-resolver.ts).

### Palette = colors

A Palette is one full set of dark-mode color tokens (`brand`, `accent`, `surface`, `surfaceMuted`, `text`, `textMuted`, `border`, `success`, `warn`, `danger`). The deck is dark-only by design, so palettes have a single token set, no light/dark split.

### Template = content

A Template is content data: the markdown directive body of a starter deck plus metadata (`category`, `slideCount`, `recommendedPresetId`). A template has no design. The same template can be spawned with any preset.

Type and registry: [src/app/templates/templates.ts](src/app/templates/templates.ts). Markdown bodies live in [src/app/templates/seeds/](src/app/templates/seeds/).

### Directive = author intent

The markdown directive vocabulary is what authors learn once and use across all presets. It carries author intent (e.g., "this slide is the hero stat"), and the active preset interprets that intent into its own bespoke composition.

Directives are tokens like `::cover`, `::section`, `::stat`, `::kpi-grid`, `::quote.big`, `::testimonial`, `::tear-sheet`, `::process-steps`, `::timeline`, `::chart`, `::table`. Authors do not pick layouts or compositions, they pick the _kind of moment_. The preset owns the rest.

## Current schema state (subject to extension when adding a real second design)

`ThemeRef`:

```ts
{ presetId: string; paletteId?: string; fontId?: string; }
```

That is the entire per-deck design override. No mode (dark only). No density (one airy scale baked into the resolver). No font slot per role (one font drives display and body, mono is fixed).

`Preset`:

```ts
{ id; name; vibe; paletteId; fontId; previewTemplateId; }
```

A preset is a named starting combination of palette + font over the existing design. To add a new _design_, you will need to extend this: the renderer's `data-preset` scoping must come back, and the preset record must point at its own CSS file and (where used) its own bespoke React components.

Block IR is unchanged: heading, text, list, quote, stat, code, box, columns, grid, cell, chart, table, image. The directives expand into block trees in [src/ir/parse.ts](src/ir/parse.ts).

## Authoring contract

The author writes markdown. The directive vocabulary is small and stable across presets. The same `::stat{value="38m"}` produces a Hero Stat composition in Dossier and a Hero Stat composition in Bauhaus, both bespoke to that preset's design. The author never picks a "layout style". The author picks intent (cover, section, hero stat, pull quote) and the preset renders.

## When to write JSX vs CSS

- **Signature moments (Tier 1)**: bespoke React components per preset. Hand-tuned positioning, exact type sizes, decorative SVG, art direction. Generic CSS will not deliver this tier.
- **Workhorse layouts (Tier 2)**: scoped CSS under `[data-preset='<id>']` is fine. The preset's voice (color, type, hairlines, spacing) applied to shared structural blocks.
- **Inline blocks (Tier 3)**: scoped CSS overrides on top of the default block components. Typography, color, small spacing tweaks.

If you find yourself trying to make a generic block render a hero-stat by tweaking CSS, stop. Build a bespoke component for the hero stat instead. Generic abstraction at the block level cannot win Tier 1.

### Layered JSX pattern for Tier 1 components

Every Tier 1 component has three layers:

1. **Background layer**: full bleed, decorative atoms, color fills, SVG shapes. This is where the preset's visual personality lives.
2. **Layout shell**: fixed insets from all four sides, baked into the component as design decisions, not exposed as props or configuration.
3. **Content layer**: the variable markdown content positioned within the shell.

The insets are part of the design. A cover slide for a given preset has specific padding because the designer chose it. That number does not change per deck and is not user-configurable.

## Anti-patterns to avoid

- Treating a Preset as a CSS skin over one generic template. It isn't. A preset is a designed deck.
- Trying to deliver Tier 1 with generic CSS. It will look templated. Use bespoke JSX. This has been tried and failed: CSS over shared generic components always produces generic-looking output regardless of how much the CSS is tuned. Bespoke JSX per slide type per preset is not optional for Tier 1.
- Adding "more flexible directives" or "more configuration" to compensate for design that is missing. Configuration cannot capture composition. Hand-design the composition instead.
- Assembling Tier 1 slides from shared component libraries. This produces UI-kit output, not editorial output. A hero stat component shared across presets will look identical across presets with just color and font differences. That is a failure.
- Bundling content (`seed`) on `Preset` or design (`paletteId` / `fontId`) on `Template`. The split is intentional and load-bearing.
- Calling the directive vocabulary "templates" in code or copy. Templates use directives; they aren't directives.
- Combining `Template` and `Preset` into one type. They are different axes (content vs design).
- Reintroducing a `mode` (light/dark) field. The system is dark-only.
- Reintroducing a `density` field on `ThemeRef`. One scale (airy, multiplier 1.35) is the system constant.
- Producing a kitchen-sink demo as the preset preview. The preview should be a curated handful of slides chosen to flatter that preset's specific compositions.

## File map (current)

- [src/app/presets/presets.ts](src/app/presets/presets.ts), preset registry.
- [src/app/templates/templates.ts](src/app/templates/templates.ts), template registry.
- [src/app/templates/seeds/](src/app/templates/seeds/), markdown bodies.
- [src/themes/palettes/](src/themes/palettes/), color token sets.
- [src/themes/fonts.ts](src/themes/fonts.ts), font catalog (matches `next/font` imports in [src/app/layout.tsx](src/app/layout.tsx)).
- [src/styles/dossier.css](src/styles/dossier.css), the locked design rules for the current (and only) deck design. Edit here to change the design itself.
- [src/styles/blocks.css](src/styles/blocks.css), [src/styles/layouts.css](src/styles/layouts.css), [src/styles/deck.css](src/styles/deck.css), structural defaults shared across all presets.
- [src/render/theme-resolver.ts](src/render/theme-resolver.ts), turns Preset + Palette + Brand into CSS variables. Spacing, radius, shadow, mono font are fixed system constants here.
- [src/render/ThemeProvider.tsx](src/render/ThemeProvider.tsx), wraps the deck and emits the CSS variables.
- [src/blocks/](src/blocks/), default block React components.
- [src/ir/parse.ts](src/ir/parse.ts), markdown directives to block IR.
- [src/ir/schema.ts](src/ir/schema.ts), IR types and zod schemas.

## Routes

- `/presets` lists presets.
- `/templates` lists templates.
- `/new` is the two-step deck creation flow: pick a template (or "Blank deck"), then a preset.
- `/d/<id>/edit` opens the editor.
- `/d/<id>/present` opens presentation mode.

## Quick mental check before changes

- Are you about to make a generic abstraction that has to work across all presets? If yes, stop. Bespoke per preset is almost always the right answer.
- Are you adding a directive that is really a layout option in disguise? If yes, the preset should own that composition, not the directive.
- Are you about to write CSS that renders the cover, section divider, hero stat, big quote, or closer? If yes, that is Tier 1. Bespoke JSX is the right tool, not CSS.
- Are you adding a "feature" to compensate for a preset feeling weak? Strengthen the preset's design instead.

## Workflow rules

- Brainstorm before building. For Tier 1 work this is non-negotiable: you must have a slide-by-slide visual description signed off before writing any JSX. Not vague ("clean", "editorial") but specific: exact type sizes, what decorative atoms appear, how space is used, what the slide does NOT include. If you do not have this, stop and ask. Writing Tier 1 code without a concrete design brief always produces generic output.
- One genuinely great preset is worth more than five mediocre ones. Do not register a preset until all 9 Tier 1 slides are solid. A weak cover or a generic hero stat means the preset is not ready to ship.
- Never auto-commit or auto-push. A prior "go ahead" does not carry over.
- Commit messages: one line, under 72 characters, imperative voice. No body. No `Co-Authored-By: Claude`.
- Never use an em dash in any output (sentences, lists, headers, code comments). Use a comma, colon, or rephrase instead.
- For tasks that can be parallelized, run agents in parallel.
