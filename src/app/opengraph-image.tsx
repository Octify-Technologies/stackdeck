import { ImageResponse } from 'next/og';

export const alt = 'stackdeck — case studies by Octify Technologies';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#0a0a0c',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 80,
        fontFamily: 'sans-serif',
        color: '#f4f4f6',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <svg width="56" height="56" viewBox="0 0 22 22" fill="none">
          <rect x="1.8" y="6.9" width="12" height="12" rx="2.6" fill="#3f3f46" />
          <rect x="5" y="5" width="12" height="12" rx="2.6" fill="#a1a1aa" />
          <rect x="8.2" y="3.1" width="12" height="12" rx="2.6" fill="#fafafa" />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: -0.5 }}>stackdeck</div>
          <div style={{ fontSize: 15, color: '#86868f', marginTop: 4, fontFamily: 'monospace' }}>
            by Octify Technologies
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div
          style={{
            display: 'flex',
            fontSize: 124,
            fontWeight: 500,
            lineHeight: 0.95,
            letterSpacing: -3.5,
            maxWidth: 1000,
          }}
        >
          <span>Selected work</span>
          <span style={{ color: '#fafafa' }}>.</span>
        </div>
        <div
          style={{
            fontSize: 22,
            color: '#86868f',
            fontFamily: 'monospace',
            letterSpacing: 0.5,
          }}
        >
          Case studies, presented as decks · octifytechnologies.com
        </div>
      </div>
    </div>,
    { ...size },
  );
}
