Never run build or tests until I ask manually.

## What this app is

Internal viewer for Octify case studies. **Bring your own HTML.** Each case study is a folder of hand-authored HTML files (one per slide) under `case-studies/<slug>/`. The app renders each slide inside a sandboxed iframe at a fixed 1920×1080 canvas, scaled to fit the viewport. There is no editor, no markdown, no theming, no presets.

The job of this app is narrow: discover case studies, list them, render them as a deck (viewer + present mode), serve their assets. Nothing else.

## The mental model

- **Author** designs slides as HTML somewhere (Astro, hand-coded, whatever). Each slide is a self-contained 1920×1080 document with inline CSS and system fonts.
- **Drop** the folder into `case-studies/<slug>/` with a `meta.json`.
- **Ship.** The app picks it up, no code change needed.

## Authoring contract (the only real rule)

Every slide HTML file must:

1. Be a complete `<!doctype html>` document.
2. Render against a 1920×1080 canvas. `body { margin: 0; width: 1920px; height: 1080px; overflow: hidden; }`.
3. Inline its CSS. No external CSS, no Google Fonts, no external scripts, no fetches. System font stacks only.
4. Have a `<title>` tag.

Slide assets go under `case-studies/<slug>/assets/` and are referenced as `assets/<file>` (resolved at runtime by `/c/<slug>/assets/<path>`).

## File map

- `case-studies/<slug>/meta.json`, deck metadata.
- `case-studies/<slug>/*.html`, one file per slide.
- `case-studies/<slug>/assets/*`, optional static assets.
- [src/lib/case-studies.ts](src/lib/case-studies.ts), manifest loader, slide reader, asset reader. Server-only.
- [src/components/SlideFrame.tsx](src/components/SlideFrame.tsx), fixed-canvas iframe with CSS scaling.
- [src/components/Viewer.tsx](src/components/Viewer.tsx), main viewer (chrome + stage + thumb strip).
- [src/components/Present.tsx](src/components/Present.tsx), fullscreen present mode.
- [src/app/page.tsx](src/app/page.tsx), index of case studies.
- [src/app/c/[slug]/page.tsx](src/app/c/[slug]/page.tsx), viewer route.
- [src/app/c/[slug]/present/page.tsx](src/app/c/[slug]/present/page.tsx), present mode route.
- [src/app/c/[slug]/slides/[file]/route.ts](src/app/c/[slug]/slides/[file]/route.ts), slide HTML serving.
- [src/app/c/[slug]/assets/[...path]/route.ts](src/app/c/[slug]/assets/[...path]/route.ts), slide asset serving.

## What this app must NOT grow into

- No editor.
- No theming, no presets, no palettes.
- No markdown, no IR, no block components.
- No customization UI of any kind.
- No "easier authoring" shortcuts that let slides skip the BYO HTML contract.

If something needs to be different per deck, it lives in the deck's HTML. Not in the app.

## Workflow rules

- Brainstorm before building. Don't auto-implement non-trivial changes.
- Never auto-commit, never auto-push. A prior "go ahead" does not carry over to git.
- Commit messages: one line, under 72 characters, imperative voice. No body. No `Co-Authored-By: Claude`.
- Never use an em dash anywhere (sentences, lists, headers, code comments). Use a comma, colon, or rephrase.
- For tasks that can be parallelized, run agents in parallel.
