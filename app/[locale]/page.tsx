'use client';

import Link from 'next/link';
import ui from '@/components/ui/ui.module.css';
import styles from './home.module.css';
import { TopBar } from '@/components/layout/TopBar';
import { Footer } from '@/components/layout/Footer';

const valuePoints = [
  {
    title: 'Accurate Time Zone Calculations',
    body: 'Compare local times between cities with automatic adjustment for daylight saving time and regional UTC offsets.',
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
    title: 'UTC & Local Time Conversion',
    body: 'Convert UTC to local time (and back) for any city — past, present, or future dates supported.',
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
    title: 'Meeting Planner Across Time Zones',
    body: 'Find the best overlapping meeting time for participants in different cities, without early mornings or late nights.',
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
    title: 'Fast, Simple & Free',
    body: 'No accounts, no setup, no complexity. Just clear answers — instantly.',
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
    title: 'DST-Aware & Reliable',
    body: 'Timezio uses official IANA time zone data. All results automatically adjust for daylight saving time changes and regional rules.',
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
    title: 'Built for Global Use',
    body: 'Supports regions with non-standard offsets (including 30- or 45-minute differences) and date changes when crossing time zones.',
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

const tools = [
  { href: '/planner', label: 'Meeting Planner', desc: 'Find overlap-friendly slots automatically and keep everyone out of late nights.', badge: 'Team favorite' },
  { href: '/time-zone-converter', label: 'Time Converter', desc: 'Convert UTC or local times, preview future dates, and share results instantly.', badge: 'Most used' },
  { href: '/compare', label: 'City Compare', desc: 'Line up multiple cities side by side to see the exact differences at a glance.' },
  { href: '/explore', label: 'Explore Globe', desc: 'Navigate the interactive globe and jump straight into any city or region.' },
];

const cityTimes = [
  { city: 'New York', tz: 'America/New_York', tag: 'EST/EDT', accent: '#60a5fa' },
  { city: 'London', tz: 'Europe/London', tag: 'GMT/BST', accent: '#34d399' },
  { city: 'Dubai', tz: 'Asia/Dubai', tag: 'GST', accent: '#f59e0b' },
  { city: 'Singapore', tz: 'Asia/Singapore', tag: 'SGT', accent: '#a78bfa' },
  { city: 'Sydney', tz: 'Australia/Sydney', tag: 'AEST/AEDT', accent: '#f472b6' },
];

const highlights = [
  { title: 'DST aware', body: 'Powered by official IANA time zone data updated automatically.' },
  { title: '10k+ cities', body: 'Every offset covered, including 30- and 45-minute differences.' },
  { title: 'Share ready', body: 'Copy clean links and send the exact time plan to your team.' },
];

const formatTime = (timeZone: string) =>
  new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone,
  }).format(new Date());

export default function Home() {
  return (
    <div className={styles.page}>
      <TopBar />
      <main className={styles.main}>
        <section className={styles.heroGrid}>
          <div className={`${ui.card} ${styles.heroCard}`}>
            <div className={styles.badgeRow}>
              <span className={styles.pill}>Live & DST-aware</span>
              <span className={styles.pill}>No sign-up</span>
              <span className={styles.pill}>Free forever</span>
            </div>
            <h1 className={styles.title}>Plan across time zones without the headaches.</h1>
            <p className={styles.lede}>Timezio helps you compare time zones, convert UTC, and lock in meeting slots between cities. Every calculation is DST-aware and powered by official IANA data.</p>
            <div className={styles.ctaRow}>
              <Link href="/planner" className={`${ui.btn} ${styles.ctaPrimary}`}>
                Plan a meeting
              </Link>
              <Link href="/time-zone-converter" className={`${ui.btn} ${styles.ctaGhost}`}>
                Open converter
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
                <p className={styles.panelEyebrow}>Live snapshot</p>
                <h3 className={styles.panelTitle}>What&apos;s happening right now</h3>
              </div>
              <span className={styles.badgeSoft}>DST verified</span>
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
            <div className={styles.panelFooter}>Live examples. Odd offsets and daylight saving rules handled automatically.</div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>Toolkit</p>
            <h2 className={styles.sectionTitle}>Everything you need for global timing</h2>
            <p className={styles.sectionBody}>Switch between the planner, converter, and city comparison without losing context.</p>
          </div>
          <div className={styles.toolsGrid}>
            {tools.map((tool) => (
              <Link key={tool.href} href={tool.href} className={`${ui.card} ${styles.toolCard}`}>
                <div className={styles.toolBadgeRow}>
                  <span className={styles.toolLabel}>{tool.label}</span>
                  {tool.badge ? <span className={styles.badgeSoft}>{tool.badge}</span> : null}
                </div>
                <p className={styles.toolDesc}>{tool.desc}</p>
                <div className={styles.toolCta}>Open →</div>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>Why Timezio</p>
            <h2 className={styles.sectionTitle}>Accuracy by default, friendly by design</h2>
            <p className={styles.sectionBody}>Built for remote teams, freelancers, and friends spread across the world.</p>
          </div>
          <div className={styles.valueGrid}>
            {valuePoints.map((item) => (
              <div key={item.title} className={styles.valueCard}>
                <span className={styles.valueIcon} style={{ color: item.accent, backgroundColor: item.accentSoft }}>
                  {item.icon}
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
