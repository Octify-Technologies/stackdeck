import Link from 'next/link';
import { listCaseStudies, type CaseStudy } from '@/lib/case-studies';
import { SlideFrame } from '@/components/SlideFrame';
import { StackdeckMark } from '@/components/StackdeckMark';
import '@/components/SlideFrame.css';
import './home.css';

export const dynamic = 'force-static';

const OCTIFY_URL = 'https://octifytechnologies.com';
const CONTACT_EMAIL = 'ankur@octifytechnologies.com';

export default async function Home() {
  const studies = await listCaseStudies();

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
            Case studies<span className="index-title-dot">.</span>
          </h1>

          {studies.length === 0 ? (
            <Empty />
          ) : (
            <ol className="entries">
              {studies.map((s, i) => (
                <Entry key={s.slug} study={s} index={i} />
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

function Entry({ study, index }: { study: CaseStudy; index: number }) {
  const num = String(index + 1).padStart(2, '0');
  const date = study.date ? formatDate(study.date) : null;
  const tags = (study.tags ?? []).slice(0, 3);

  return (
    <li className="entry" style={{ animationDelay: `${100 + index * 60}ms` }}>
      <Link href={`/c/${study.slug}`} className="entry-link">
        <span className="entry-num" aria-hidden>
          {num}
        </span>

        <div className="entry-body">
          <div className="entry-meta">
            {study.client ? <span className="entry-client">{study.client}</span> : null}
            {study.industry ? (
              <>
                <span className="entry-meta-dot" aria-hidden>
                  ·
                </span>
                <span className="entry-industry">{study.industry}</span>
              </>
            ) : null}
            {date ? <span className="entry-date">{date}</span> : null}
          </div>

          <h2 className="entry-title">{study.title}</h2>

          {study.summary ? <p className="entry-summary">{study.summary}</p> : null}

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
              {study.slides.length} {study.slides.length === 1 ? 'slide' : 'slides'}
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
            src={`/c/${study.slug}/slides/${study.cover}`}
            title={study.title}
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
      <p className="empty-line">No case studies published yet.</p>
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
