import { ImageResponse } from 'next/og';

// Raster (PNG) logo at /logo.png for Organization JSON-LD (schema.org prefers a
// raster logo over SVG).
export const runtime = 'nodejs';

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0b1220',
          color: '#60a5fa',
          fontSize: 300,
          fontWeight: 800,
          fontFamily: 'sans-serif',
        }}
      >
        T
      </div>
    ),
    { width: 512, height: 512 }
  );
}
