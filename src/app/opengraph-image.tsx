import { ImageResponse } from 'next/og';

export const alt = 'stackdeck — open-source markdown slide deck builder';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #0b0b0f 0%, #1a1530 60%, #2a1240 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 80,
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <svg width="84" height="84" viewBox="0 0 22 22" fill="none">
          <rect x="1.8" y="6.9" width="12" height="12" rx="2" fill="#6366f1" />
          <rect x="5" y="5" width="12" height="12" rx="2" fill="#ec4899" />
          <rect x="8.2" y="3.1" width="12" height="12" rx="2" fill="#f59e0b" />
        </svg>
        <div style={{ color: '#fff', fontSize: 56, fontWeight: 700, letterSpacing: -1 }}>
          stackdeck
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div
          style={{
            color: '#fff',
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -2,
            maxWidth: 980,
          }}
        >
          Markdown in. Beautiful slides out.
        </div>
        <div style={{ color: '#b8b3c7', fontSize: 32, lineHeight: 1.3, maxWidth: 900 }}>
          Open-source slide deck builder. Switch themes instantly. Export to PDF.
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            padding: '12px 24px',
            borderRadius: 999,
            background: '#6366f1',
            color: '#fff',
            fontSize: 24,
            fontWeight: 600,
          }}
        >
          stackdeck.octifytechnologies.com
        </div>
        <div style={{ color: '#7d7896', fontSize: 22 }}>No backend. No accounts. No lock-in.</div>
      </div>
    </div>,
    { ...size },
  );
}
