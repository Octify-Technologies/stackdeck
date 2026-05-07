import { ImageResponse } from 'next/og';
import { getCaseStudy } from '@/lib/case-studies';

export const alt = 'Octify case study';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function CaseStudyOG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = await getCaseStudy(slug);
  const title = study?.title ?? 'Octify case study';
  const client = study?.client;
  const summary = study?.summary;

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
        <svg width="48" height="48" viewBox="0 0 22 22" fill="none">
          <rect x="1.8" y="6.9" width="12" height="12" rx="2.6" fill="#3f3f46" />
          <rect x="5" y="5" width="12" height="12" rx="2.6" fill="#a1a1aa" />
          <rect x="8.2" y="3.1" width="12" height="12" rx="2.6" fill="#fafafa" />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.4 }}>
            Octify Case Study
          </div>
          <div
            style={{
              fontSize: 14,
              color: '#86868f',
              marginTop: 4,
              fontFamily: 'monospace',
              letterSpacing: 0.5,
              textTransform: 'uppercase',
            }}
          >
            {client ? client : 'octifytechnologies.com'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div
          style={{
            fontSize: title.length > 40 ? 88 : 112,
            fontWeight: 500,
            lineHeight: 0.98,
            letterSpacing: -3,
            maxWidth: 1040,
          }}
        >
          <span>{title}</span>
          <span style={{ color: '#818cf8' }}>.</span>
        </div>
        {summary ? (
          <div
            style={{
              fontSize: 22,
              color: '#c8c8cf',
              lineHeight: 1.4,
              maxWidth: 980,
              display: 'flex',
            }}
          >
            {summary.length > 160 ? `${summary.slice(0, 158)}…` : summary}
          </div>
        ) : (
          <div
            style={{
              fontSize: 18,
              color: '#86868f',
              fontFamily: 'monospace',
              letterSpacing: 0.5,
              display: 'flex',
            }}
          >
            Case study, presented as a deck · octifytechnologies.com
          </div>
        )}
      </div>
    </div>,
    { ...size },
  );
}
