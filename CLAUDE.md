Never run build or tests until I ask manually.

## What this app is

Internal viewer for Octify case studies. **Bring your own HTML.** Each case study is a Sanity document with a `slides[]` array, where each slide stores a complete hand-authored HTML document. The app renders each slide inside a sandboxed iframe at a fixed 1920x1080 canvas, scaled to fit the viewport. There is no editor in the app, no markdown, no theming, no presets. Authoring happens in Sanity Studio at `/studio`.

The job of this app is narrow: list case studies, render them as a deck (viewer + present mode), generate per-deck PDFs and OG images. Nothing else.

## The mental model

- **Author** designs each slide as HTML somewhere (Astro, hand-coded, whatever). Each slide is a self-contained 1920x1080 document with inline CSS and system fonts.
- **Paste** the slide HTML into a `caseStudy` document in Sanity Studio (`/studio`).
- **Publish.** Sanity webhook hits `/api/revalidate` and the deck appears in seconds. No deploy.

## Authoring contract (the only real rule)

Every slide HTML must:

1. Be a complete `<!doctype html>` document.
2. Render against a 1920x1080 canvas. `body { margin: 0; width: 1920px; height: 1080px; overflow: hidden; }`.
3. Inline its CSS. No external CSS, no Google Fonts, no external scripts, no fetches. System font stacks only.
4. Have a `<title>` tag.

Images and other assets are uploaded to Sanity directly and referenced by their `cdn.sanity.io` URL inside the slide HTML's `<img>` tags. The app does not proxy assets; it does not host any.

## File map

- `studio/sanity.config.ts`, Sanity Studio configuration.
- `studio/schemas/caseStudy.ts`, Sanity schema for a case study (metadata + slides[]).
- [src/lib/sanity.ts](src/lib/sanity.ts), Sanity client and cache-tag identifiers.
- [src/lib/case-studies.ts](src/lib/case-studies.ts), GROQ-backed loader (`listCaseStudies`, `getCaseStudy`, `readSlide`).
- [src/components/SlideFrame.tsx](src/components/SlideFrame.tsx), fixed-canvas iframe with CSS scaling.
- [src/components/Viewer.tsx](src/components/Viewer.tsx), main viewer (chrome + stage + thumb strip).
- [src/components/Present.tsx](src/components/Present.tsx), fullscreen present mode.
- [src/app/page.tsx](src/app/page.tsx), index of case studies.
- [src/app/c/[slug]/page.tsx](src/app/c/[slug]/page.tsx), viewer route.
- [src/app/c/[slug]/slides/[file]/route.ts](src/app/c/[slug]/slides/[file]/route.ts), slide HTML serving (file = stringified slide index).
- [src/app/c/[slug]/opengraph-image.tsx](src/app/c/[slug]/opengraph-image.tsx), per-deck social card.
- [src/app/api/revalidate/route.ts](src/app/api/revalidate/route.ts), Sanity webhook receiver.
- [src/app/studio/[[...tool]]/page.tsx](src/app/studio/[[...tool]]/page.tsx), embedded Sanity Studio.

## What this app must NOT grow into

- No in-app editor (use Sanity Studio).
- No theming, no presets, no palettes.
- No markdown, no IR, no block components.
- No customization UI of any kind.
- No "easier authoring" shortcuts that let slides skip the BYO HTML contract.

If something needs to be different per deck, it lives in the deck's HTML. Not in the app.

## Required env vars

- `NEXT_PUBLIC_SANITY_PROJECT_ID`, the Sanity project ID.
- `NEXT_PUBLIC_SANITY_DATASET`, defaults to `production`.
- `NEXT_PUBLIC_SANITY_API_VERSION`, ISO date, defaults to `2024-10-01`.
- `SANITY_READ_TOKEN`, optional, required only if previewing unpublished drafts.
- `SANITY_WEBHOOK_SECRET`, required for the `/api/revalidate` webhook to verify signatures. Configure the same value in the Sanity webhook settings.

See `.env.example`.

## Workflow rules

- Brainstorm before building. Don't auto-implement non-trivial changes.
- Never auto-commit, never auto-push. A prior "go ahead" does not carry over to git.
- Commit messages: one line, under 72 characters, imperative voice. No body. No `Co-Authored-By: Claude`.
- Never use an em dash anywhere (sentences, lists, headers, code comments). Use a comma, colon, or rephrase.
- For tasks that can be parallelized, run agents in parallel.
