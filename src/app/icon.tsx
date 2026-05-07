import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width="32" height="32" viewBox="0 0 22 22" fill="none">
        <rect x="1.8" y="6.9" width="12" height="12" rx="2.6" fill="#d4d4d8" />
        <rect x="5" y="5" width="12" height="12" rx="2.6" fill="#737373" />
        <rect x="8.2" y="3.1" width="12" height="12" rx="2.6" fill="#0a0a0a" />
      </svg>
    </div>,
    { ...size },
  );
}
