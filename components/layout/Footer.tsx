'use client';

import Link from 'next/link';
import { popularConverters, popularCities, popularMeetings } from '@/data/seoLinks';
import styles from './layout.module.css';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const openCookieSettings = () => {
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('open-cookie-settings'));
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerColumns}>
          <div className={styles.footerColumn}>
            <h3 className={styles.footerColumnTitle}>PRODUCT</h3>
            <ul className={styles.footerLinks}>
              <li><Link href="/" className={styles.footerLink}>Home</Link></li>
              <li><Link href="/explore" className={styles.footerLink}>Explore Globe</Link></li>
              <li><Link href="/compare" className={styles.footerLink}>Compare Zones</Link></li>
              <li><Link href="/planner" className={styles.footerLink}>Meeting Planner</Link></li>
              <li><Link href="/time-zone-converter" className={styles.footerLink}>Time Converter</Link></li>
            </ul>
          </div>

          <div className={styles.footerColumn}>
            <h3 className={styles.footerColumnTitle}>EXPLORE</h3>
            <ul className={styles.footerLinks}>
              <li><Link href="/time" className={styles.footerLink}>World Clock</Link></li>
              <li><Link href="/convert" className={styles.footerLink}>Converters</Link></li>
              <li><Link href="/meeting" className={styles.footerLink}>Meeting Times</Link></li>
              <li><Link href="/dst" className={styles.footerLink}>Daylight Saving</Link></li>
              <li><Link href="/blog" className={styles.footerLink}>Blog</Link></li>
            </ul>
          </div>

          <div className={styles.footerColumn}>
            <h3 className={styles.footerColumnTitle}>POPULAR</h3>
            <ul className={styles.footerLinks}>
              {popularConverters.slice(0, 2).map((item) => (
                <li key={item.slug}>
                  <Link href={`/convert/${item.slug}`} className={styles.footerLink}>{item.label}</Link>
                </li>
              ))}
              {popularCities.slice(0, 2).map((item) => (
                <li key={item.slug}>
                  <Link href={`/time/${item.slug}`} className={styles.footerLink}>{item.label}</Link>
                </li>
              ))}
              {popularMeetings.slice(0, 1).map((item) => (
                <li key={item.slug}>
                  <Link href={`/meeting/${item.slug}`} className={styles.footerLink}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.footerColumn}>
            <h3 className={styles.footerColumnTitle}>LEGAL</h3>
            <ul className={styles.footerLinks}>
              <li><Link href="/about" className={styles.footerLink}>About</Link></li>
              <li><Link href="/contact" className={styles.footerLink}>Contact</Link></li>
              <li><Link href="/privacy" className={styles.footerLink}>Privacy Policy</Link></li>
              <li><Link href="/terms" className={styles.footerLink}>Terms of Service</Link></li>
              <li>
                <button
                  type="button"
                  onClick={openCookieSettings}
                  className={styles.footerLink}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit', textAlign: 'left' }}
                >
                  Cookie settings
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <div className={styles.footerBottomLeft}>
            <p className={styles.footerCopyright}>
              © {currentYear} Timezio by AffSquad. All rights reserved.
            </p>
            <p className={styles.footerLegal}>
              Information on this website is provided for general reference only. Accuracy is not guaranteed. No liability is accepted to the extent permitted by EU law. Cookies or similar technologies may be used for analytics and advertising in accordance with your consent choices.
            </p>
          </div>
          <div className={styles.footerBottomRight}>
            <Link href="/privacy" className={styles.footerBottomLink}>Privacy</Link>
            <span className={styles.footerBottomDivider}>•</span>
            <Link href="/terms" className={styles.footerBottomLink}>Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
