'use client';

export function ExportPdf({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        if (typeof window !== 'undefined') window.print();
      }}
    >
      Export PDF
    </button>
  );
}
