import Link from 'next/link';
import { StackdeckMark } from '@/components/StackdeckMark';
import './not-found.css';

export default function CaseStudyNotFound() {
  return (
    <div className="nf">
      <header className="nf-bar">
        <Link href="/" className="nf-brand" aria-label="stackdeck">
          <StackdeckMark size={22} />
          <span>stackdeck</span>
        </Link>
      </header>
      <main className="nf-main">
        <span className="nf-eyebrow">404 — case study not found</span>
        <h1 className="nf-title">
          We could not find <span className="nf-title-accent">that deck.</span>
        </h1>
        <p className="nf-sub">
          The case study you were looking for has been moved or never existed. Head back to the
          index and pick another one.
        </p>
        <Link href="/" className="nf-cta">
          <span>Back to all decks</span>
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
            <path
              d="M1 5h12m0 0L9 1m4 4L9 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </main>
    </div>
  );
}
