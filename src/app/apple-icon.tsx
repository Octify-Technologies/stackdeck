import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 36,
      }}
    >
      <svg width="124" height="124" viewBox="0 0 22 22" fill="none">
        <rect x="1.8" y="6.9" width="12" height="12" rx="2.6" fill="#3f3f46" />
        <rect x="5" y="5" width="12" height="12" rx="2.6" fill="#a1a1aa" />
        <rect x="8.2" y="3.1" width="12" height="12" rx="2.6" fill="#fafafa" />
      </svg>
    </div>,
    { ...size },
  );
}
