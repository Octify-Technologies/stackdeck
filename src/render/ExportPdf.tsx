'use client';

export function ExportPdf({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        if (typeof window !== 'undefined') window.print();
      }}
      aria-label="Export deck as PDF"
    >
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
        <path
          d="M6.5 1.5V8.5M6.5 8.5L3.5 5.5M6.5 8.5L9.5 5.5M2 10.5V11.5H11V10.5"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>Export PDF</span>
    </button>
  );
}
