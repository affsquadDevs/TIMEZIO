import Link from 'next/link';
import type { Metadata } from 'next';
import styles from '@/components/layout/layout.module.css';
import ui from '@/components/ui/ui.module.css';
import { TopBar } from '@/components/layout/TopBar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: true },
};

const links = [
  { href: '/', label: 'Home' },
  { href: '/time', label: 'World clock' },
  { href: '/convert', label: 'Time zone converters' },
  { href: '/meeting', label: 'Meeting times by city pair' },
  { href: '/dst', label: 'Daylight saving time checker' },
  { href: '/blog', label: 'Blog' },
];

export default function NotFound() {
  return (
    <div className={styles.layout}>
      <TopBar />
      <div className={styles.main}>
        <div className={ui.card} style={{ width: '100%', maxWidth: 640, margin: '0 auto' }}>
          <div className={ui.cardBody}>
            <p style={{ fontSize: 48, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>404</p>
            <h1 className={ui.title} style={{ fontSize: '22px', margin: '8px 0 10px' }}>
              This page could not be found
            </h1>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              The link may be broken or the page may have moved. Try one of these instead:
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '10px' }}>
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={ui.link} style={{ fontWeight: 600 }}>
                    → {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
