# stackdeck

A bring-your-own-HTML deck viewer. Drop a folder of self-contained HTML files into `slides/<slug>/`, get a polished web viewer with present mode, browser-side PDF export, and per-deck OG images. Optional Sanity CMS for non-developer authoring.

No editor, no theming layer, no markdown directives. Each slide is exactly the HTML you wrote, scaled to fit the viewport.

## Why

Most deck tools force you into their templates and editors. This one stays out of the way. If you can ship a `1920×1080` HTML document, you can ship a slide. The viewer adds chrome (sidebar, navigation, present mode, PDF export) without touching what's inside the slide.

Use it for sales decks shared as URLs, internal show-and-tells, or any context where you want the reach of a web link plus the precision of hand-authored HTML.

## Quick start

```bash
git clone https://github.com/Octify-Technologies/stackdeck
cd stackdeck
pnpm install
pnpm dev
```

Open `http://localhost:3000`. The index will be empty until you add a deck.

### Add your first deck

```bash
mkdir -p slides/hello/assets
cat > slides/hello/meta.json <<'EOF'
{
  "slug": "hello",
  "title": "Hello, deck",
  "summary": "First slide deck.",
  "visibility": "public"
}
EOF
cat > slides/hello/01.html <<'EOF'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Hello</title>
  <style>
    body { margin: 0; width: 1920px; height: 1080px; overflow: hidden;
           display: grid; place-items: center; background: #0a0a0a; color: #fafafa;
           font: 600 200px/1 -apple-system, sans-serif; letter-spacing: -0.04em; }
  </style>
</head>
<body>Hello.</body>
</html>
EOF
```

Reload `http://localhost:3000`. Your deck appears. Click in to view, press `F` for present mode, click "Download PDF" to export.

## How it works

Each deck is a folder under `slides/<slug>/`:

- `meta.json` describes the deck (title, client, slug, etc.).
- `01.html`, `02.html`, ... are individual slide documents.
- `assets/` holds any images or fonts referenced from the slide HTML.

Each slide HTML is loaded into a sandboxed iframe at a fixed `1920×1080` canvas, scaled with CSS `transform: scale(...)` to whatever space the viewer has. The viewer chrome lives outside the iframe and never touches your slide content.

## Authoring contract

Every slide HTML must:

1. Be a complete `<!doctype html>` document.
2. Render against a `1920×1080` canvas. Set `body { margin: 0; width: 1920px; height: 1080px; overflow: hidden; }`.
3. Inline its CSS. No external stylesheets, no Google Fonts, no external scripts. Use system font stacks.
4. Include a `<title>` tag, used as the slide name in the viewer's Contents sidebar.

Static assets go in `slides/<slug>/assets/` and are referenced relatively from the slide:

```html
<img src="./assets/logo.png" alt="Logo">
```

The viewer injects a `<base href="/c/<slug>/">` tag when serving the slide so relative paths resolve correctly inside the iframe.

## `meta.json` reference

```json
{
  "slug": "acme-launch",
  "title": "How Acme launched their public API",
  "client": "Acme Corp",
  "industry": "B2B SaaS",
  "date": "2026-03-12",
  "summary": "One-line summary shown on the index card and in social previews.",
  "tags": ["api", "launch"],
  "cover": "01.html",
  "slides": [
    { "file": "01.html", "title": "Cover" },
    { "file": "02.html", "title": "The brief" }
  ],
  "visibility": "public"
}
```

| Field        | Required | Notes                                                                                                       |
| ------------ | -------- | ----------------------------------------------------------------------------------------------------------- |
| `slug`       | yes      | Must match folder name. Kebab-case, `[a-z0-9-]+`.                                                           |
| `title`      | yes      | Deck title shown in the viewer's chrome.                                                                    |
| `client`     | no       | Optional client name shown in breadcrumbs.                                                                  |
| `industry`   | no       | Free-form string.                                                                                           |
| `date`       | no       | ISO date, used to sort the index.                                                                           |
| `summary`    | no       | Up to ~280 chars. Shown on the homepage card and OG image.                                                  |
| `tags`       | no       | Array of strings, rendered as colored chips on the index.                                                   |
| `cover`      | no       | Filename of the slide used as the cover thumbnail. Defaults to first slide.                                 |
| `slides`     | no       | Explicit slide order. If omitted, all `*.html` files in the folder are picked up in lexicographic order.    |
| `visibility` | no       | `"public"` (default) or `"private"`. Private decks are reachable via direct link but hidden from the index. |

## Routes

| URL                       | What it serves                                    |
| ------------------------- | ------------------------------------------------- |
| `/`                       | Index of public decks                             |
| `/c/<slug>`               | Viewer (sidebar + main slide + chrome)            |
| `/c/<slug>/slides/<file>` | Raw slide HTML, used as the iframe source         |
| `/c/<slug>/assets/<path>` | Slide static assets                               |
| `/api/revalidate`         | Sanity webhook receiver (no-op without Sanity)    |
| `http://localhost:3333`   | Sanity Studio (standalone, run via `pnpm studio`) |

## Keyboard shortcuts

| Key                | Viewer             | Present           |
| ------------------ | ------------------ | ----------------- |
| `→` `Space` `PgDn` | Next slide         | Next slide        |
| `←` `PgUp`         | Previous slide     | Previous slide    |
| `Home` / `End`     | First / last       | First / last      |
| `1`–`9`            | Jump to slide      | Jump to slide     |
| `F`                | Enter present mode | —                 |
| `Esc`              | —                  | Exit present mode |

## URL parameters

| Parameter         | Effect                                                                                         |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| `?to=<recipient>` | Shows a "for `<recipient>`" chip in the breadcrumb and personalizes mailto / PDF contact card. |
| `#<n>`            | Open the deck on slide `<n>` (1-indexed). The hash updates as you navigate.                    |

## PDF export

Click "Download PDF" in the viewer. The browser renders each slide into a JPEG via `html-to-image`, assembles a one-slide-per-page PDF via `jsPDF`, and triggers a Blob download. An Octify-branded contact card is appended as the last page.

Output is rasterized (text isn't selectable in the resulting PDF) but every glyph is preserved exactly as your browser painted it, so font fidelity is guaranteed regardless of what's installed on the recipient's machine.

To customize the PDF contact card branding, edit `renderContactCardToJpeg` in [src/lib/generate-pdf.ts](src/lib/generate-pdf.ts).

## Optional: Sanity CMS

If you want non-developers to author decks, you can connect Sanity. Decks created in Sanity Studio appear in the index alongside filesystem decks. When both sources contain the same slug, Sanity wins.

1. Create a Sanity project at https://sanity.io/manage.
2. Set env vars in `.env.local` (see `.env.example`):
   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID=<your project id>
   NEXT_PUBLIC_SANITY_DATASET=production
   SANITY_WEBHOOK_SECRET=<random string>
   ```
3. Add CORS origins for `http://localhost:3000` and your production URL in the Sanity dashboard.
4. Run `pnpm studio` to start the Sanity Studio at `http://localhost:3333`. Sign in, create a `deck` document, paste the slide HTML into each slide entry. Publish.
5. Configure a webhook (Project → API → Webhooks) pointing at `<your-domain>/api/revalidate`:
   - Filter (GROQ): `_type == "deck"`
   - Projection: `{ "_type": _type, "slug": slug.current }`
   - Secret: matches `SANITY_WEBHOOK_SECRET`

Without these env vars the app silently uses the filesystem only.

## Configuration

All env vars are optional. App boots with none set; only filesystem decks are served.

| Var                              | Purpose                                                      |
| -------------------------------- | ------------------------------------------------------------ |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`  | Enables the Sanity loader path.                              |
| `NEXT_PUBLIC_SANITY_DATASET`     | Defaults to `production`.                                    |
| `NEXT_PUBLIC_SANITY_API_VERSION` | ISO date, defaults to `2024-10-01`.                          |
| `SANITY_READ_TOKEN`              | Required only for previewing unpublished drafts.             |
| `SANITY_WEBHOOK_SECRET`          | Required for `/api/revalidate` to verify webhook signatures. |

## Development

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm typecheck
pnpm lint
pnpm build
```

## Deploying

Vercel is the simplest target.

1. Connect the GitHub repo to Vercel.
2. Add the Sanity env vars from `.env.example` to the Vercel project (or skip them entirely to run filesystem-only).
3. Push to `main`.

Per-deck OG images are statically generated at build time. The PDF generation runs entirely in the visitor's browser, so it has no serverless cold-start cost.

## File map

- `slides/<slug>/` — filesystem decks (gitignored is fine if Sanity is your source of truth).
- `studio/` — Sanity schema and config.
- [src/lib/decks.ts](src/lib/decks.ts) — hybrid loader (Sanity + filesystem).
- [src/lib/sanity.ts](src/lib/sanity.ts) — Sanity client (returns `null` if env vars missing).
- [src/lib/generate-pdf.ts](src/lib/generate-pdf.ts) — browser-side PDF generator.
- [src/components/Viewer.tsx](src/components/Viewer.tsx) — main viewer.
- [src/components/Present.tsx](src/components/Present.tsx) — fullscreen present mode.
- [src/components/SlideFrame.tsx](src/components/SlideFrame.tsx) — fixed-canvas iframe.
- [src/app/c/[slug]/](src/app/c/[slug]/) — viewer routes (page, slide HTML, assets, OG image).
- [src/app/api/revalidate/](src/app/api/revalidate/) — Sanity webhook receiver.

## Contributing

Issues and PRs welcome. Two guardrails worth knowing:

- The app is intentionally narrow. No in-app editor, no theming layer, no markdown. If you want a different visual per deck, put it in the deck's HTML.
- Keep the BYO HTML contract intact. Any feature that lets slides skip "complete `<!doctype html>` document at 1920×1080 with inlined CSS" is a non-starter.

## License

MIT.
