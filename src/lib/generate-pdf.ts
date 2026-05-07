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
 * browser supports. The only way to guarantee identical output on the
 * recipient's machine, regardless of their installed system fonts, is to
 * rasterize on the author's machine with the author's fonts already painted.
 * Vector PDF text is not viable here without a server-side browser engine.
 */
export async function generateDeckPdf(opts: GenerateOptions): Promise<void> {
  const { slug, filename, slides, pixelRatio = 2, quality = 0.92, onProgress } = opts;
  if (!slides.length) throw new Error('No slides to render.');

  onProgress?.({ phase: 'preparing' });

  // Off-screen host. Position fixed off-viewport so layout never reflows the
  // visible page.
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

      const dataUrl = await renderSlideToJpeg(host, slug, slides[i].file, {
        pixelRatio,
        quality,
      });

      if (i > 0) pdf.addPage([CANVAS_W, CANVAS_H], 'landscape');
      pdf.addImage(dataUrl, 'JPEG', 0, 0, CANVAS_W, CANVAS_H, undefined, 'FAST');
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
): Promise<string> {
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

    return await toJpeg(doc.documentElement, {
      width: CANVAS_W,
      height: CANVAS_H,
      pixelRatio: opts.pixelRatio,
      quality: opts.quality,
      backgroundColor: '#ffffff',
      cacheBust: false,
      // Skip embedding external fonts. Slides per the project contract use
      // system font stacks only, so we let the browser paint with what's
      // already loaded; the result is rasterized regardless.
      skipFonts: true,
    });
  } finally {
    iframe.remove();
  }
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
        // Wait for fonts the slide may still be loading (system fonts resolve
        // synchronously, but custom @font-face rules would not).
        if (doc.fonts && typeof doc.fonts.ready?.then === 'function') {
          await doc.fonts.ready;
        }
        // Wait for any remaining images.
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
        // One paint frame to settle any final styles.
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
