'use client';

import { jsPDF } from 'jspdf';
import { toJpeg } from 'html-to-image';

const CANVAS_W = 1920;
const CANVAS_H = 1080;

export type SlideRef = { file: string; title?: string };

export type ProgressEvent =
  | { phase: 'preparing' }
  | { phase: 'rendering'; current: number; total: number }
  | { phase: 'composing' }
  | { phase: 'done' };

type PdfLink = { x: number; y: number; w: number; h: number; url: string };

type GenerateOptions = {
  slug: string;
  filename: string;
  slides: SlideRef[];
  /** Pixel ratio for rasterization. 2 = retina-grade. Higher = sharper but bigger files. */
  pixelRatio?: number;
  /** JPEG quality, 0..1. */
  quality?: number;
  onProgress?: (event: ProgressEvent) => void;
};

/**
 * Render every slide into a hidden 1920x1080 iframe, snapshot it to a JPEG,
 * then assemble a one-page-per-slide PDF and trigger a Blob download.
 *
 * Why JPEG raster pages: the BYO HTML rule means slides may use any CSS the
 * browser supports. Rasterizing on the author's machine guarantees identical
 * output on the recipient's machine. Anchor positions are reapplied as PDF
 * link annotations so URLs and mailtos stay clickable on the rasterized page.
 */
export async function generateDeckPdf(opts: GenerateOptions): Promise<void> {
  const { slug, filename, slides, pixelRatio = 2, quality = 0.92, onProgress } = opts;
  if (!slides.length) throw new Error('No slides to render.');

  onProgress?.({ phase: 'preparing' });

  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText =
    'position:fixed;left:-100000px;top:0;width:1920px;height:1080px;pointer-events:none;contain:strict;';
  document.body.appendChild(host);

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [CANVAS_W, CANVAS_H],
    compress: true,
    hotfixes: ['px_scaling'],
  });

  try {
    for (let i = 0; i < slides.length; i++) {
      onProgress?.({ phase: 'rendering', current: i + 1, total: slides.length });

      const { dataUrl, links } = await renderSlideToJpeg(host, slug, slides[i].file, {
        pixelRatio,
        quality,
      });

      if (i > 0) pdf.addPage([CANVAS_W, CANVAS_H], 'landscape');
      pdf.addImage(dataUrl, 'JPEG', 0, 0, CANVAS_W, CANVAS_H, undefined, 'FAST');
      for (const link of links) {
        pdf.link(link.x, link.y, link.w, link.h, { url: link.url });
      }
    }

    onProgress?.({ phase: 'composing' });
    pdf.save(filename);
    onProgress?.({ phase: 'done' });
  } finally {
    host.remove();
  }
}

async function renderSlideToJpeg(
  host: HTMLElement,
  slug: string,
  file: string,
  opts: { pixelRatio: number; quality: number },
): Promise<{ dataUrl: string; links: PdfLink[] }> {
  const iframe = document.createElement('iframe');
  iframe.width = String(CANVAS_W);
  iframe.height = String(CANVAS_H);
  iframe.style.cssText = `border:0;width:${CANVAS_W}px;height:${CANVAS_H}px;background:#fff;`;
  // Same-origin + allow-same-origin lets us reach contentDocument for snapshotting.
  iframe.setAttribute('sandbox', 'allow-same-origin');
  iframe.src = `/c/${slug}/slides/${file}`;
  host.appendChild(iframe);

  try {
    await waitForIframeReady(iframe);

    const doc = iframe.contentDocument;
    if (!doc) throw new Error(`Cannot read slide document for ${file}.`);

    const links = extractLinks(doc);

    // Pre-compute the @font-face CSS with fonts inlined as data URIs. Passing
    // this via `fontEmbedCSS` skips html-to-image's cssRules scan, which
    // throws SecurityError on the cross-origin Google Fonts stylesheet.
    const fontEmbedCSS = await getFontEmbedCss();

    const dataUrl = await toJpeg(doc.documentElement, {
      width: CANVAS_W,
      height: CANVAS_H,
      pixelRatio: opts.pixelRatio,
      quality: opts.quality,
      backgroundColor: '#ffffff',
      cacheBust: false,
      ...(fontEmbedCSS ? { fontEmbedCSS, skipFonts: false } : { skipFonts: true }),
    });

    return { dataUrl, links };
  } finally {
    iframe.remove();
  }
}

function extractLinks(doc: Document): PdfLink[] {
  const anchors = Array.from(doc.querySelectorAll<HTMLAnchorElement>('a[href]'));
  const out: PdfLink[] = [];
  for (const a of anchors) {
    const href = a.href;
    if (!href) continue;
    const rect = a.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    out.push({ x: rect.left, y: rect.top, w: rect.width, h: rect.height, url: href });
  }
  return out;
}

function waitForIframeReady(iframe: HTMLIFrameElement): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const onLoad = async () => {
      iframe.removeEventListener('load', onLoad);
      iframe.removeEventListener('error', onError);
      try {
        const doc = iframe.contentDocument;
        if (!doc) {
          resolve();
          return;
        }
        if (doc.fonts && typeof doc.fonts.ready?.then === 'function') {
          await doc.fonts.ready;
        }
        const images = Array.from(doc.images) as HTMLImageElement[];
        await Promise.all(
          images.map((img) =>
            img.complete && img.naturalWidth > 0
              ? Promise.resolve()
              : new Promise<void>((r) => {
                  img.addEventListener('load', () => r(), { once: true });
                  img.addEventListener('error', () => r(), { once: true });
                }),
          ),
        );
        await new Promise<void>((r) => requestAnimationFrame(() => r()));
        resolve();
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    };
    const onError = () => {
      iframe.removeEventListener('load', onLoad);
      iframe.removeEventListener('error', onError);
      reject(new Error('Slide failed to load.'));
    };
    iframe.addEventListener('load', onLoad);
    iframe.addEventListener('error', onError);
  });
}

// Match the slide HTML's Google Fonts request so the embed CSS matches what
// the slides render with. Kept here, not in each slide, because PDF export
// is what needs the fonts inlined as data URIs.
const GOOGLE_FONTS_CSS_URL =
  'https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap';

let fontEmbedCssPromise: Promise<string | null> | null = null;

function getFontEmbedCss(): Promise<string | null> {
  if (!fontEmbedCssPromise) {
    fontEmbedCssPromise = buildFontEmbedCss().catch((err) => {
      console.warn('Could not prebuild font embed CSS; PDF will use fallback fonts.', err);
      // Reset so a later export can retry; transient network errors shouldn't
      // poison the cache for the rest of the session.
      fontEmbedCssPromise = null;
      return null;
    });
  }
  return fontEmbedCssPromise;
}

async function buildFontEmbedCss(): Promise<string> {
  const cssRes = await fetch(GOOGLE_FONTS_CSS_URL);
  if (!cssRes.ok) throw new Error(`Font CSS fetch failed: ${cssRes.status}`);
  let css = await cssRes.text();

  const matches = Array.from(css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g));
  const uniqueUrls = Array.from(new Set(matches.map((m) => m[1])));

  const replacements = await Promise.all(
    uniqueUrls.map(async (url) => {
      const fontRes = await fetch(url);
      if (!fontRes.ok) throw new Error(`Font fetch failed ${fontRes.status}: ${url}`);
      const blob = await fontRes.blob();
      const dataUri = await blobToDataUri(blob);
      return [url, dataUri] as const;
    }),
  );

  for (const [url, dataUri] of replacements) {
    css = css.split(url).join(dataUri);
  }

  return css;
}

function blobToDataUri(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error || new Error('FileReader error'));
    reader.readAsDataURL(blob);
  });
}
