import { ImageResponse } from 'next/og';

// Real raster (PNG) Open Graph image at /og-image.png — replaces the previous
// SVG, which social platforms and AdSense don't treat as a valid OG image.
export const runtime = 'nodejs';

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0b1220 0%, #1e3a8a 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 110, fontWeight: 800, letterSpacing: '-2px' }}>Timezio</div>
        <div style={{ fontSize: 38, opacity: 0.92, marginTop: 16 }}>
          Time Zone Converter · World Clock · Meeting Planner
        </div>
        <div style={{ fontSize: 26, opacity: 0.7, marginTop: 28 }}>DST-aware · powered by IANA data</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
