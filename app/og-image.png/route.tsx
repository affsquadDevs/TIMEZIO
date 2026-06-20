import { ImageResponse } from 'next/og';
import { readFileSync } from 'node:fs';

// On-brand Open Graph / social card (1200×630) rendered with next/og so it stays
// in sync with the brand in code — no static raster to maintain. Uses the brand
// font (Space Grotesk) and the globe motif from the logo.
export const runtime = 'nodejs';

const grotesk = (weight: number) =>
  readFileSync(new URL(`./SpaceGrotesk-${weight}.woff`, import.meta.url));

// Globe-only mark (no card background, no clock) used as a large faint backdrop.
const globe = `
<svg width="560" height="560" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="r" x1="120" y1="120" x2="392" y2="392" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#5eead4"/>
      <stop offset="0.5" stop-color="#38bdf8"/>
      <stop offset="1" stop-color="#2563eb"/>
    </linearGradient>
  </defs>
  <g stroke="url(#r)" stroke-width="9" fill="none" stroke-linecap="round">
    <circle cx="256" cy="256" r="200"/>
    <ellipse cx="256" cy="256" rx="84" ry="200" stroke-opacity="0.85"/>
    <ellipse cx="256" cy="256" rx="166" ry="200" stroke-opacity="0.45" stroke-width="6"/>
    <line x1="62" y1="256" x2="450" y2="256" stroke-opacity="0.85"/>
    <line x1="104" y1="168" x2="408" y2="168" stroke-opacity="0.4" stroke-width="6"/>
    <line x1="104" y1="344" x2="408" y2="344" stroke-opacity="0.4" stroke-width="6"/>
  </g>
</svg>`;

const globeUri = `data:image/svg+xml;base64,${Buffer.from(globe).toString('base64')}`;

const Chip = ({ label }: { label: string }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      padding: '11px 24px',
      borderRadius: 999,
      background: 'rgba(125, 211, 252, 0.10)',
      border: '1px solid rgba(125, 211, 252, 0.28)',
      color: '#bae6fd',
      fontSize: 27,
      fontWeight: 500,
      whiteSpace: 'nowrap',
      flexShrink: 0,
    }}
  >
    {label}
  </div>
);

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: 'linear-gradient(140deg, #0b1326 0%, #0a0f1d 55%, #0b1020 100%)',
          fontFamily: 'Space Grotesk',
          overflow: 'hidden',
        }}
      >
        {/* blue glow behind the globe */}
        <div
          style={{
            position: 'absolute',
            top: -160,
            right: -160,
            width: 760,
            height: 760,
            borderRadius: 999,
            background: 'radial-gradient(circle, rgba(37,99,235,0.40) 0%, rgba(37,99,235,0) 68%)',
          }}
        />
        {/* globe motif, bleeding off the right edge */}
        <img
          src={globeUri}
          width={800}
          height={800}
          style={{ position: 'absolute', top: -125, right: -205, opacity: 0.92 }}
        />
        {/* top accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: 8,
            background: 'linear-gradient(90deg, #5eead4 0%, #38bdf8 50%, #2563eb 100%)',
          }}
        />

        {/* content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            height: '100%',
            padding: '0 80px',
            maxWidth: 800,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
                fontSize: 138,
                fontWeight: 700,
                letterSpacing: '-5px',
                color: '#ffffff',
                lineHeight: 1,
              }}
            >
              Timezio
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 48,
                fontWeight: 600,
                color: '#93c5fd',
                marginTop: 26,
                letterSpacing: '-0.5px',
              }}
            >
              Time Zone Converter &amp; Meeting Planner
            </div>
          </div>

          <div style={{ display: 'flex', gap: 18, marginTop: 48 }}>
            <Chip label="World Clock" />
            <Chip label="DST-aware" />
            <Chip label="IANA tz data" />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: 56,
              fontSize: 32,
              fontWeight: 600,
              color: '#e2e8f0',
            }}
          >
            <div
              style={{
                display: 'flex',
                width: 14,
                height: 14,
                borderRadius: 999,
                background: '#38bdf8',
                marginRight: 16,
              }}
            />
            timezio.com
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Space Grotesk', data: grotesk(500), weight: 500, style: 'normal' },
        { name: 'Space Grotesk', data: grotesk(600), weight: 600, style: 'normal' },
        { name: 'Space Grotesk', data: grotesk(700), weight: 700, style: 'normal' },
      ],
    }
  );
}
