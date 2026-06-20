import type { Metadata } from 'next';
import './globals.css';

// Global fallback 404 for non-localized / unmatched paths. It is self-contained
// (renders its own <html>/<body>) because the locale layout — which normally
// provides those — only wraps routes under /[locale].
export const metadata: Metadata = {
  title: 'Page Not Found | Timezio',
  robots: { index: false, follow: true },
};

const links = [
  { href: '/', label: 'Home' },
  { href: '/time', label: 'World clock' },
  { href: '/convert', label: 'Time zone converters' },
  { href: '/blog', label: 'Blog' },
];

export default function GlobalNotFound() {
  return (
    <html lang="en" data-theme="dark">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0b1120',
          color: '#e2e8f0',
          fontFamily:
            'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        <main style={{ textAlign: 'center', padding: '24px', maxWidth: 520 }}>
          <p style={{ fontSize: 56, fontWeight: 800, margin: 0 }}>404</p>
          <h1 style={{ fontSize: 22, margin: '8px 0 12px' }}>This page could not be found</h1>
          <p style={{ color: '#94a3b8', lineHeight: 1.6, marginBottom: 20 }}>
            The link may be broken or the page may have moved.
          </p>
          <nav style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {links.map((l) => (
              <a key={l.href} href={l.href} style={{ color: '#60a5fa', fontWeight: 600 }}>
                {l.label}
              </a>
            ))}
          </nav>
        </main>
      </body>
    </html>
  );
}
