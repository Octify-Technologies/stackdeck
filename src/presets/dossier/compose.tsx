import type { ReactNode } from 'react';

import { BlockRenderer } from '@/blocks';
import type { Columns, Deck, Grid, Quote, Slide } from '@/ir/schema';

import { BodyFrame } from './atoms/Furniture';
import { findChart, findFirst } from './extract';
import { DossierBeforeAfter } from './slides/BeforeAfter';
import { DossierChart } from './slides/Chart';
import { DossierCloser } from './slides/Closer';
import { DossierCover } from './slides/Cover';
import { DossierHeroStat } from './slides/HeroStat';
import { DossierKpiGrid } from './slides/KpiGrid';
import { DossierPullQuote } from './slides/PullQuote';
import { DossierSection } from './slides/SectionDivider';
import { DossierTearSheet } from './slides/TearSheet';

type Ctx = {
  deck: Deck;
  index: number;
  total: number;
  section?: string;
};

type Meta = {
  project: string;
  client?: string;
  date?: string;
  dossier?: string;
  issueNumber?: string;
};

const FIG_OFFSET = { hero: 1, kpi: 2, ba: 3, chart: 4 };

export function composeDossierSlide(slide: Slide, ctx: Ctx): ReactNode | null {
  const meta = readMeta(ctx.deck);
  const folio = `p. ${String(ctx.index + 1).padStart(2, '0')} / ${String(ctx.total).padStart(2, '0')}`;
  const chapter = chapterRoman(ctx.deck, ctx.index);

  // Cover, first slide.
  if (ctx.index === 0 && slide.layout === 'cover') {
    return (
      <DossierCover
        slide={slide}
        deck={ctx.deck}
        client={meta.client}
        date={meta.date}
        dossier={meta.dossier}
        issueNumber={meta.issueNumber}
      />
    );
  }

  // Closer, last slide.
  if (ctx.index === ctx.total - 1 && (slide.layout === 'cover' || isCloserShape(slide))) {
    return (
      <DossierCloser slide={slide} client={meta.client} date={meta.date} dossier={meta.dossier} />
    );
  }

  // Section divider.
  if (slide.layout === 'section') {
    const chapterIndex = countSectionsUpTo(ctx.deck, ctx.index);
    const pageRange = sectionPageRange(ctx.deck, ctx.index);
    return (
      <DossierSection
        slide={slide}
        chapterIndex={chapterIndex}
        pageStart={pageRange.start}
        pageEnd={pageRange.end}
        project={meta.project}
        dossier={meta.dossier}
      />
    );
  }

  // Tear sheet.
  if (isTearSheet(slide)) {
    return (
      <DossierTearSheet
        slide={slide}
        project={meta.project}
        dossier={meta.dossier}
        folio={folio}
        filedBy="Octify Strategy Desk"
        filedOn={meta.date}
      />
    );
  }

  // KPI grid before hero so a 4+stat slide doesn't collapse.
  if (isKpiGrid(slide)) {
    return (
      <DossierKpiGrid
        slide={slide}
        project={meta.project}
        dossier={meta.dossier}
        folio={folio}
        section={ctx.section}
        figure={`Fig. 0${FIG_OFFSET.kpi}`}
        date={meta.date}
      />
    );
  }

  // Hero stat: a single Stat is the dominant block.
  if (isHeroStat(slide)) {
    return (
      <DossierHeroStat
        slide={slide}
        project={meta.project}
        dossier={meta.dossier}
        folio={folio}
        section={ctx.section}
        figure={`Fig. 0${FIG_OFFSET.hero}`}
      />
    );
  }

  // Big pull quote.
  if (slide.layout === 'fullBleed' && findFirst<Quote>(slide.blocks, 'quote')) {
    return (
      <DossierPullQuote
        slide={slide}
        project={meta.project}
        dossier={meta.dossier}
        folio={folio}
        filed={meta.date}
      />
    );
  }

  // Before / after.
  if (isBeforeAfter(slide)) {
    return (
      <DossierBeforeAfter
        slide={slide}
        project={meta.project}
        dossier={meta.dossier}
        folio={folio}
        figure={`Fig. 0${FIG_OFFSET.ba}`}
      />
    );
  }

  // Chart slide.
  if (findChart(slide)) {
    return (
      <DossierChart
        slide={slide}
        project={meta.project}
        dossier={meta.dossier}
        folio={folio}
        section={ctx.section}
        figure={`Fig. 0${FIG_OFFSET.chart}`}
      />
    );
  }

  // Body slide. Wrap the default block flow with the running head + spine
  // + folio frame so even Tier 2 layouts feel like part of the dossier.
  return (
    <BodyFrame
      project={meta.project}
      dossier={meta.dossier}
      folio={folio}
      section={ctx.section}
      chapter={chapter}
    >
      {/* Render default blocks via the SlideRenderer's fallback path. */}
      <BodyBlocks slide={slide} />
    </BodyFrame>
  );
}

function BodyBlocks({ slide }: { slide: Slide }) {
  return (
    <>
      {slide.blocks.map((block, i) => (
        <BlockRenderer key={i} block={block} />
      ))}
    </>
  );
}

function readMeta(deck: Deck): Meta {
  const title = deck.title ?? '';
  const numMatch = /N[º°]?\s*(\d+)/i.exec(title);
  const num = numMatch ? numMatch[1] : '014';
  const dossier = `Dossier № ${num}`;
  const issueNumber = `Issue ${num}`;
  const date =
    deck.footer?.match(/[A-Z][a-z]+\s+\d{4}/)?.[0]?.toUpperCase() ??
    new Date(deck.updatedAt)
      .toLocaleString('en-US', { month: 'long', year: 'numeric' })
      .toUpperCase();
  return {
    project: deck.brand?.name ?? 'Field Study',
    client: deck.brand?.name,
    date,
    dossier,
    issueNumber,
  };
}

function countSectionsUpTo(deck: Deck, index: number): number {
  let count = 0;
  for (let i = 0; i <= index; i++) {
    if (deck.slides[i].layout === 'section') count++;
  }
  return Math.max(1, count);
}

function sectionPageRange(deck: Deck, sectionIdx: number): { start: number; end: number } {
  const start = sectionIdx + 1;
  let end = deck.slides.length;
  for (let i = sectionIdx + 1; i < deck.slides.length; i++) {
    if (deck.slides[i].layout === 'section') {
      end = i;
      break;
    }
  }
  return { start, end };
}

function chapterRoman(deck: Deck, index: number): string | undefined {
  const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
  let count = 0;
  let assigned = 0;
  for (let i = 0; i <= index; i++) {
    if (deck.slides[i].layout === 'section') {
      count++;
      if (i === index) return undefined;
      assigned = count;
    }
  }
  return assigned > 0 ? `§ ${ROMAN[assigned] ?? assigned}` : undefined;
}

function isCloserShape(slide: Slide): boolean {
  const text = slide.blocks
    .filter((b) => b.type === 'heading' || b.type === 'text')
    .map((b) => ('text' in b ? b.text : ''))
    .join(' ')
    .toLowerCase();
  return /thank you|thanks|fin|closer|contact|afterword/.test(text);
}

function isTearSheet(slide: Slide): boolean {
  const grid = findFirst<Grid>(slide.blocks, 'grid');
  if (!grid) return false;
  const captionPairs = grid.children.filter((b) => b.type === 'text' && b.emphasis === 'caption');
  return captionPairs.length >= 2;
}

function isKpiGrid(slide: Slide): boolean {
  if (slide.layout !== 'grid') return false;
  const grid = findFirst<Grid>(slide.blocks, 'grid');
  if (!grid) return false;
  const stats = grid.children.filter((b) => b.type === 'stat');
  return stats.length >= 3;
}

function isHeroStat(slide: Slide): boolean {
  const stats = slide.blocks.filter((b) => b.type === 'stat');
  if (stats.length !== 1) return false;
  const heavy = slide.blocks.filter(
    (b) => b.type === 'grid' || b.type === 'chart' || b.type === 'columns' || b.type === 'table',
  );
  return heavy.length === 0;
}

function isBeforeAfter(slide: Slide): boolean {
  if (slide.layout !== 'split') return false;
  const cols = findFirst<Columns>(slide.blocks, 'columns');
  if (!cols || cols.columns.length !== 2) return false;
  const tones = cols.columns.map((col) => {
    const box = col.find((b) => b.type === 'box');
    return box && 'tone' in box ? box.tone : undefined;
  });
  return tones[0] === 'warn' && tones[1] === 'success';
}
