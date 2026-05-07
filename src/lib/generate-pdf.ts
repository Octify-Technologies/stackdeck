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

export type ContactCard = {
  deckTitle: string;
  client?: string;
  recipient?: string | null;
  senderName: string;
  contactEmail: string;
};

type GenerateOptions = {
  slug: string;
  filename: string;
  slides: SlideRef[];
  /** Pixel ratio for rasterization. 2 = retina-grade. Higher = sharper but bigger files. */
  pixelRatio?: number;
  /** JPEG quality, 0..1. */
  quality?: number;
  /** When provided, an Octify-branded contact page is appended as the final PDF page. */
  contactCard?: ContactCard;
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
  const { slug, filename, slides, pixelRatio = 2, quality = 0.92, contactCard, onProgress } = opts;
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

  const totalPages = slides.length + (contactCard ? 1 : 0);

  try {
    for (let i = 0; i < slides.length; i++) {
      onProgress?.({ phase: 'rendering', current: i + 1, total: totalPages });

      const dataUrl = await renderSlideToJpeg(host, slug, slides[i].file, {
        pixelRatio,
        quality,
      });

      if (i > 0) pdf.addPage([CANVAS_W, CANVAS_H], 'landscape');
      pdf.addImage(dataUrl, 'JPEG', 0, 0, CANVAS_W, CANVAS_H, undefined, 'FAST');
    }

    if (contactCard) {
      onProgress?.({ phase: 'rendering', current: totalPages, total: totalPages });
      const dataUrl = await renderContactCardToJpeg(host, contactCard, {
        pixelRatio,
        quality,
      });
      pdf.addPage([CANVAS_W, CANVAS_H], 'landscape');
      pdf.addImage(dataUrl, 'JPEG', 0, 0, CANVAS_W, CANVAS_H, undefined, 'FAST');
    }

    onProgress?.({ phase: 'composing' });
    pdf.save(filename);
    onProgress?.({ phase: 'done' });
  } finally {
    host.remove();
  }
}

/**
 * Render an Octify-branded "thanks for reading" page. Same rendering pipeline
 * as a real slide so the output is visually consistent with the deck.
 */
async function renderContactCardToJpeg(
  host: HTMLElement,
  card: ContactCard,
  opts: { pixelRatio: number; quality: number },
): Promise<string> {
  const recipientLine = card.recipient
    ? `<div class="recipient">Prepared for ${escapeHtml(card.recipient)}</div>`
    : '';
  const clientLine = card.client
    ? `<div class="client">${escapeHtml(card.client)} · ${escapeHtml(card.deckTitle)}</div>`
    : `<div class="client">${escapeHtml(card.deckTitle)}</div>`;
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Get in touch</title>
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    width: 1920px;
    height: 1080px;
    overflow: hidden;
    background: #0a0a0a;
    color: #f4f4f6;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    position: relative;
  }
  .frame {
    position: absolute;
    inset: 96px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .top {
    display: flex;
    align-items: center;
    gap: 16px;
    font-family: ui-monospace, 'SF Mono', Menlo, monospace;
    font-size: 14px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #6e6e75;
  }
  .top .mark {
    display: inline-flex;
    width: 28px;
    height: 28px;
    align-items: center;
    justify-content: center;
  }
  .recipient {
    margin-top: 24px;
    font-family: ui-monospace, 'SF Mono', Menlo, monospace;
    font-size: 16px;
    letter-spacing: 0.04em;
    color: #818cf8;
  }
  .middle {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
  .eyebrow {
    font-family: ui-monospace, 'SF Mono', Menlo, monospace;
    font-size: 13px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #86868f;
  }
  h1 {
    margin: 0;
    font-size: 132px;
    font-weight: 500;
    letter-spacing: -0.04em;
    line-height: 0.95;
    max-width: 1500px;
  }
  h1 .accent { color: #818cf8; }
  .subhead {
    font-size: 24px;
    line-height: 1.4;
    color: #c8c8cf;
    max-width: 920px;
  }
  .bottom {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 32px;
  }
  .contact {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .contact-label {
    font-family: ui-monospace, 'SF Mono', Menlo, monospace;
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #56565d;
  }
  .contact-email {
    font-size: 36px;
    letter-spacing: -0.012em;
    color: #f4f4f6;
    font-weight: 500;
  }
  .meta {
    text-align: right;
    font-family: ui-monospace, 'SF Mono', Menlo, monospace;
    font-size: 12px;
    color: #56565d;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    line-height: 1.6;
  }
  .client {
    color: #86868f;
  }
</style>
</head>
<body>
  <div class="frame">
    <div class="top">
      <span class="mark">
        <svg width="28" height="28" viewBox="0 0 22 22" fill="none">
          <rect x="1.8" y="6.9" width="12" height="12" rx="2.6" fill="#3f3f46" />
          <rect x="5" y="5" width="12" height="12" rx="2.6" fill="#a1a1aa" />
          <rect x="8.2" y="3.1" width="12" height="12" rx="2.6" fill="#fafafa" />
        </svg>
      </span>
      <span>Octify Technologies</span>
      ${recipientLine}
    </div>

    <div class="middle">
      <div class="eyebrow">Thanks for reading</div>
      <h1>Like what you<br>just saw<span class="accent">.</span></h1>
      <div class="subhead">If anything in this deck sparked an idea, let's get on a call. ${escapeHtml(
        card.senderName,
      )} replies fast and brings receipts.</div>
    </div>

    <div class="bottom">
      <div class="contact">
        <span class="contact-label">Reply to ${escapeHtml(card.senderName)}</span>
        <span class="contact-email">${escapeHtml(card.contactEmail)}</span>
      </div>
      <div class="meta">
        ${clientLine}
        <div>octifytechnologies.com</div>
      </div>
    </div>
  </div>
</body>
</html>`;

  const iframe = document.createElement('iframe');
  iframe.width = String(CANVAS_W);
  iframe.height = String(CANVAS_H);
  iframe.style.cssText = `border:0;width:${CANVAS_W}px;height:${CANVAS_H}px;background:#0a0a0a;`;
  iframe.setAttribute('sandbox', 'allow-same-origin');
  iframe.srcdoc = html;
  host.appendChild(iframe);

  try {
    await waitForIframeReady(iframe);
    const doc = iframe.contentDocument;
    if (!doc) throw new Error('Cannot read contact card document.');
    return await toJpeg(doc.documentElement, {
      width: CANVAS_W,
      height: CANVAS_H,
      pixelRatio: opts.pixelRatio,
      quality: opts.quality,
      backgroundColor: '#0a0a0a',
      cacheBust: false,
      skipFonts: true,
    });
  } finally {
    iframe.remove();
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });
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
