# stackdeck

Internal viewer for Octify case study decks. Bring your own HTML, render as a deck.

## How it works

Each case study lives in `case-studies/<slug>/` as a folder of self-contained HTML files (one per slide) plus a `meta.json` describing the deck. The viewer renders each slide inside a sandboxed iframe at a fixed **1920×1080** canvas, scaled to fit the viewport.

There is no editor, no theming layer, no markdown directives. Slides are authored elsewhere (Astro, hand-coded HTML, whatever) and dropped in.

## Authoring contract

Every slide HTML file must:

1. Be a complete `<!doctype html>` document.
2. Render against a **1920×1080** canvas. Set `body { margin: 0; width: 1920px; height: 1080px; overflow: hidden; }`.
3. Inline its CSS (no external CSS, no Google Fonts, no external scripts). Use system font stacks.
4. Include a `<title>` tag, used as the slide name.

Static assets (images, fonts) live in `case-studies/<slug>/assets/` and are served at `/c/<slug>/assets/<path>`.

## `meta.json`

```json
{
  "slug": "acme-churn",
  "title": "How Acme cut churn by 38%",
  "client": "Acme Corp",
  "industry": "B2B SaaS",
  "date": "2026-03-12",
  "summary": "One-line summary shown on the index card.",
  "tags": ["churn", "lifecycle"],
  "cover": "01.html",
  "slides": [
    { "file": "01.html", "title": "Cover" },
    { "file": "02.html", "title": "Tear sheet" }
  ],
  "visibility": "public"
}
```

`slides` is optional. If omitted, all `*.html` files in the folder are picked up in lexicographic order, and each slide title is read from its `<title>` tag.

## Routes

- `/` — case studies index
- `/c/<slug>` — viewer (thumbnail strip + main slide + chrome)
- `/c/<slug>/present` — fullscreen present mode
- `/c/<slug>/slides/<file>` — raw slide HTML (iframe source, also openable directly for debugging)
- `/c/<slug>/assets/<path>` — slide static assets

## Keyboard

| Key                | Viewer        | Present       |
| ------------------ | ------------- | ------------- |
| `→` `Space` `PgDn` | Next          | Next          |
| `←` `PgUp`         | Prev          | Prev          |
| `Home` / `End`     | First / Last  | First / Last  |
| `1`–`9`            | —             | Jump to slide |
| `F`                | Enter present | —             |
| `Esc`              | —             | Exit          |

## Development

```bash
pnpm install
pnpm dev
```

## Publishing a case study

1. Create `case-studies/<slug>/` with a `meta.json` and your HTML files.
2. Open a PR. Merge.
3. Deploy.

That's it.
