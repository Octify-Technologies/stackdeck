import Link from 'next/link';
import { listDecks, type Deck } from '@/lib/decks';
import { SlideFrame } from '@/components/SlideFrame';
import { StackdeckMark } from '@/components/StackdeckMark';
import '@/components/SlideFrame.css';
import './home.css';

export const dynamic = 'force-static';

const OCTIFY_URL = 'https://octifytechnologies.com';
const CONTACT_EMAIL = 'ankur@octifytechnologies.com';

export default async function Home() {
  const decks = await listDecks();

  return (
    <div className="home">
      <header className="masthead">
        <div className="masthead-inner">
          <Link href="/" className="wordmark" aria-label="stackdeck">
            <StackdeckMark size={28} />
            <span className="wordmark-stack">
              <span className="wordmark-text">stackdeck</span>
              <span className="wordmark-by">
                <span className="wordmark-pulse" aria-hidden />
                by Octify Technologies
              </span>
            </span>
          </Link>
          <nav className="masthead-nav">
            <a
              href={OCTIFY_URL}
              className="masthead-link"
              target="_blank"
              rel="noreferrer noopener"
            >
              <span>Visit Octify</span>
              <ExternalIcon />
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="masthead-cta">
              Get in touch
            </a>
          </nav>
        </div>
      </header>

      <main className="home-main">
        <section className="index">
          <h1 className="index-title">
            Decks<span className="index-title-dot">.</span>
          </h1>

          {decks.length === 0 ? (
            <Empty />
          ) : (
            <ol className="entries">
              {decks.map((d, i) => (
                <Entry key={d.slug} deck={d} index={i} />
              ))}
            </ol>
          )}
        </section>
      </main>

      <footer className="home-footer">
        <div className="home-footer-inner">
          <div className="home-footer-brand">
            <StackdeckMark size={20} />
            <div className="home-footer-brand-text">
              <span className="home-footer-name">Octify Technologies</span>
              <span className="eyebrow home-footer-tagline">Selected work, presented.</span>
            </div>
          </div>
          <div className="home-footer-links">
            <a
              href={OCTIFY_URL}
              className="home-footer-link"
              target="_blank"
              rel="noreferrer noopener"
            >
              Website <ExternalIcon size={10} />
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="home-footer-link">
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
        <div className="home-footer-baseline">
          <span className="eyebrow">© {new Date().getFullYear()} Octify Technologies</span>
          <span className="eyebrow">All rights reserved</span>
        </div>
      </footer>
    </div>
  );
}

const TAG_TONES = ['sky', 'amber', 'rose', 'emerald', 'violet'] as const;

function tagTone(tag: string): (typeof TAG_TONES)[number] {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) >>> 0;
  return TAG_TONES[h % TAG_TONES.length];
}

function Entry({ deck, index }: { deck: Deck; index: number }) {
  const num = String(index + 1).padStart(2, '0');
  const date = deck.date ? formatDate(deck.date) : null;
  const tags = (deck.tags ?? []).slice(0, 3);

  return (
    <li className="entry" style={{ animationDelay: `${100 + index * 60}ms` }}>
      <Link href={`/c/${deck.slug}`} className="entry-link">
        <span className="entry-num" aria-hidden>
          {num}
        </span>

        <div className="entry-body">
          <div className="entry-meta">
            {deck.client ? <span className="entry-client">{deck.client}</span> : null}
            {deck.industry ? (
              <>
                <span className="entry-meta-dot" aria-hidden>
                  ·
                </span>
                <span className="entry-industry">{deck.industry}</span>
              </>
            ) : null}
            {date ? <span className="entry-date">{date}</span> : null}
          </div>

          <h2 className="entry-title">{deck.title}</h2>

          {deck.summary ? <p className="entry-summary">{deck.summary}</p> : null}

          <div className="entry-foot">
            {tags.length > 0 ? (
              <div className="entry-tags">
                {tags.map((t) => (
                  <span key={t} className={`chip chip-tag chip-tag-${tagTone(t)}`}>
                    <span className="chip-dot" aria-hidden />
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
            <span className="entry-count">
              {deck.slides.length} {deck.slides.length === 1 ? 'slide' : 'slides'}
            </span>
            <span className="entry-arrow" aria-hidden>
              <span className="entry-arrow-text">Read</span>
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                <path
                  d="M1 6h14m0 0L10 1m5 5l-5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </div>

        <div className="entry-cover">
          <SlideFrame
            src={`/c/${deck.slug}/slides/${deck.cover}`}
            title={deck.title}
            lazy
            interactive={false}
          />
        </div>
      </Link>
    </li>
  );
}

function Empty() {
  return (
    <div className="empty">
      <div className="empty-icon" aria-hidden>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect
            x="6"
            y="10"
            width="28"
            height="20"
            rx="3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
        </svg>
      </div>
      <p className="empty-line">No decks published yet.</p>
      <p className="empty-hint">Check back soon, or get in touch with Octify directly.</p>
    </div>
  );
}

function ExternalIcon({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M4 2h6m0 0v6m0-6L4.5 7.5M3 4.5V10h5.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}
