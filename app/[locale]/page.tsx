'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import ui from '@/components/ui/ui.module.css';
import styles from './home.module.css';
import { TopBar } from '@/components/layout/TopBar';
import { Footer } from '@/components/layout/Footer';

// Visual-only metadata kept in code; the text comes from the message catalog
// and is zipped by index with these arrays.
const valueVisuals = [
  {
    accent: '#2563eb',
    accentSoft: 'rgba(37, 99, 235, 0.12)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l3 3" />
      </svg>
    ),
  },
  {
    accent: '#22c55e',
    accentSoft: 'rgba(34, 197, 94, 0.14)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10M1 14l5.37 5.37A9 9 0 0 0 20.49 15" />
      </svg>
    ),
  },
  {
    accent: '#f97316',
    accentSoft: 'rgba(249, 115, 22, 0.14)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="2" ry="2" />
        <path d="M16 2v4" />
        <path d="M8 2v4" />
        <path d="M3 10h18" />
      </svg>
    ),
  },
  {
    accent: '#a855f7',
    accentSoft: 'rgba(168, 85, 247, 0.14)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2H6a2 2 0 0 0-2 2v7h9" />
        <path d="M13 2l9 9-9 9v-5H7a2 2 0 0 1-2-2v-2" />
      </svg>
    ),
  },
  {
    accent: '#06b6d4',
    accentSoft: 'rgba(6, 182, 212, 0.14)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22a10 10 0 1 0-10-10" />
        <path d="M12 6v6l3 3" />
      </svg>
    ),
  },
  {
    accent: '#ec4899',
    accentSoft: 'rgba(236, 72, 153, 0.14)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
      </svg>
    ),
  },
];

const toolMeta = [
  { href: '/planner' },
  { href: '/time-zone-converter' },
  { href: '/compare' },
  { href: '/explore' },
];

const cityTimes = [
  { city: 'New York', tz: 'America/New_York', tag: 'EST/EDT', accent: '#60a5fa' },
  { city: 'London', tz: 'Europe/London', tag: 'GMT/BST', accent: '#34d399' },
  { city: 'Dubai', tz: 'Asia/Dubai', tag: 'GST', accent: '#f59e0b' },
  { city: 'Singapore', tz: 'Asia/Singapore', tag: 'SGT', accent: '#a78bfa' },
  { city: 'Sydney', tz: 'Australia/Sydney', tag: 'AEST/AEDT', accent: '#f472b6' },
];

const formatTime = (timeZone: string) =>
  new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone,
  }).format(new Date());

export default function Home() {
  const t = useTranslations('home');
  const badges = t.raw('badges') as string[];
  const highlights = t.raw('highlights') as { title: string; body: string }[];
  const tools = t.raw('tools') as { label: string; desc: string; badge: string }[];
  const values = t.raw('values') as { title: string; body: string }[];

  return (
    <div className={styles.page}>
      <TopBar />
      <main className={styles.main}>
        <section className={styles.heroGrid}>
          <div className={`${ui.card} ${styles.heroCard}`}>
            <div className={styles.badgeRow}>
              {badges.map((b) => (
                <span key={b} className={styles.pill}>{b}</span>
              ))}
            </div>
            <h1 className={styles.title}>{t('title')}</h1>
            <p className={styles.lede}>{t('lede')}</p>
            <div className={styles.ctaRow}>
              <Link href="/planner" className={`${ui.btn} ${styles.ctaPrimary}`}>
                {t('ctaPlanner')}
              </Link>
              <Link href="/time-zone-converter" className={`${ui.btn} ${styles.ctaGhost}`}>
                {t('ctaConverter')}
              </Link>
            </div>
            <div className={styles.metaRow}>
              {highlights.map((item) => (
                <div key={item.title} className={styles.metaCard}>
                  <div className={styles.metaTitle}>{item.title}</div>
                  <div className={styles.metaBody}>{item.body}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${ui.card} ${styles.heroPanel}`}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.panelEyebrow}>{t('panelEyebrow')}</p>
                <h3 className={styles.panelTitle}>{t('panelTitle')}</h3>
              </div>
              <span className={styles.badgeSoft}>{t('panelBadge')}</span>
            </div>
            <div className={styles.cityList}>
              {cityTimes.map((city) => (
                <div key={city.tz} className={styles.cityRow}>
                  <div className={styles.cityMeta}>
                    <span className={styles.cityDot} style={{ background: city.accent }} />
                    <div>
                      <div className={styles.cityName}>{city.city}</div>
                      <div className={styles.cityZone}>{city.tag}</div>
                    </div>
                  </div>
                  <span className={styles.cityTime}>{formatTime(city.tz)}</span>
                </div>
              ))}
            </div>
            <div className={styles.panelFooter}>{t('panelFooter')}</div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>{t('toolkitEyebrow')}</p>
            <h2 className={styles.sectionTitle}>{t('toolkitTitle')}</h2>
            <p className={styles.sectionBody}>{t('toolkitBody')}</p>
          </div>
          <div className={styles.toolsGrid}>
            {tools.map((tool, i) => (
              <Link key={toolMeta[i].href} href={toolMeta[i].href} className={`${ui.card} ${styles.toolCard}`}>
                <div className={styles.toolBadgeRow}>
                  <span className={styles.toolLabel}>{tool.label}</span>
                  {tool.badge ? <span className={styles.badgeSoft}>{tool.badge}</span> : null}
                </div>
                <p className={styles.toolDesc}>{tool.desc}</p>
                <div className={styles.toolCta}>{t('toolOpen')}</div>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>{t('whyEyebrow')}</p>
            <h2 className={styles.sectionTitle}>{t('whyTitle')}</h2>
            <p className={styles.sectionBody}>{t('whyBody')}</p>
          </div>
          <div className={styles.valueGrid}>
            {values.map((item, i) => (
              <div key={item.title} className={styles.valueCard}>
                <span className={styles.valueIcon} style={{ color: valueVisuals[i].accent, backgroundColor: valueVisuals[i].accentSoft }}>
                  {valueVisuals[i].icon}
                </span>
                <div className={styles.valueTitle}>{item.title}</div>
                <div className={styles.valueBody}>{item.body}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
