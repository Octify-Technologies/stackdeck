# Roadmap

Wave 1: Ship a real case study

- Two premium templates only: `case-study-pro` (sales-call optimized) and `case-study-editorial` (sendable PDF optimized)
- Bespoke React composition per template, IR as the shared contract
- Real `::grid` and `::cell` primitives with span control and asymmetric splits
- Image support with bleed, focal-point crop, captions, aspect-ratio control
- Drag-drop and paste image directly into the preview pane
- Asset library per project: logos, photos, screenshots reusable across every deck in the project
- Brand kit per project: logo, colors, fonts, footer
- Projects and folders to organize decks
- Premium directives: `::cover`, `::section`, `::scope-strip`, `::problem`, `::approach`, `::kpi-grid`, `::big-number`, `::before-after`, `::testimonial-card`, `::pull-quote`, `::asset-frame`, `::annotated-image`, `::tear-sheet`, `::contact`
- Smart number formatting and auto trend arrows in `::kpi-grid` and `::big-number` (`$1.2M`, `+47%↑` with OpenType numerals)
- Source citations on stats rendered as designed footnotes
- Designed page furniture: page numbers, kickers, footers, section markers
- PDF export: 16:9 landscape true bleed, vector-only, font subsetting, hyperlinks, bookmarks, auto TOC
- Fullscreen present mode with arrow-key nav (no notes, no timer)

Wave 2: Live in it day to day

- In-preview editing: click any element in the preview to edit in place
- Drag-to-reorder slides in the thumbnail panel
- Undo and redo
- Duplicate slide
- Slide library: save any slide as a reusable block
- Outline view
- Keyboard shortcuts (cmd+/, cmd+d, cmd+1..9)
- Version history via auto-snapshots
- Full-text search across all stored decks
- Click-to-zoom on images during present
- Cursor highlight / spotlight mode during present
- PDF watermark modes at export: DRAFT, CONFIDENTIAL, FOR REVIEW, INTERNAL ONLY
- Workspace export and import as a single `.zip` (decks, assets, templates, brand kits)

Wave 3: Premium finish

- Background system per template: gradients, grain, decorative shapes
- Image treatments per template: duotone, B&W, polaroid, hard-frame, mask
- Auto-contrast on every palette swap
- Smart layout selection (3 stats horizontal, 4 stats 2x2, 6 stats 3x2)
- Color contrast linter
- Required alt text on images
- Custom font upload (woff2)
