Never run build or tests until I ask manually.

## Vocabulary (lock these meanings)

A **deck** is the final artifact: a stored slide deck the user edits, presents, and exports. A deck is created by combining a **preset** with an optional **template**.

### Preset = design

When working on a preset, Claude has full freedom to apply changes at any level (style CSS, palette, typography, density, motion, scoped overrides, supporting theme files). Presets are the primary output of this tool, so think deeply before designing one: study existing presets, consider the visual system as a whole, and aim for a coherent, distinctive result rather than a surface-level tweak.

A **Preset** is a visual design and nothing else. It owns:

- `styleId` (typography system, radii, shadows, motion)
- `paletteId` (brand and accent colors)
- `density` (spacing scale)
- `defaultMode` (light or dark)
- `previewTemplateId` (which template the gallery uses to render the card preview)

A preset has NO content. It is the "house style" of a deck. Multiple presets coexist (`octify-magazine`, plus future ones for brutalist, swiss-modernist, cinematic-dark, etc.).

Type and registry: [src/app/presets/presets.ts](src/app/presets/presets.ts). Visual rules live in [src/themes/styles/](src/themes/styles/) and [src/themes/palettes/](src/themes/palettes/), with per-preset CSS scoped under `.deck-root[data-style='<presetStyleId>']` (see [src/styles/magazine.css](src/styles/magazine.css) for the pattern).

### Template = content

A **Template** is content data for a starter deck. It owns:

- `seed` (markdown with directives)
- `category` (case-study, pitch, sales, internal)
- `slideCount`
- `recommendedPresetId` (the preset the gallery uses for preview render and spawns by default)

A template has NO design. The same template can be spawned with any preset and re-skinned without touching its markdown.

Type and registry: [src/app/templates/templates.ts](src/app/templates/templates.ts). Markdown bodies live in [src/app/templates/seeds/](src/app/templates/seeds/).

### Quick mental check

- Adding a new design → new **preset**.
- Adding a new starter deck (different content shape) → new **template**.
- "Light vs dark" is a property of a preset, NOT a template.
- The directive vocabulary itself (`::cover`, `::kpi-grid`, `::testimonial`, `::process-steps`, etc.) is part of the directive system, not a "template". Templates USE directives; they aren't directives.

### Routes

- `/presets` lists presets (designs).
- `/templates` lists templates (content).
- `/new` is the two-step deck creation flow: step 1 picks a template (or "Blank deck"), step 2 picks a preset.

### Anti-patterns to avoid

- Do NOT bundle a `seed` field on `Preset`.
- Do NOT bundle `styleId`/`paletteId` on `Template`.
- Do NOT add a single combined "TemplatePreset" type. The split is intentional and load-bearing.
- Do NOT call the directive vocabulary "templates" in code or copy.
