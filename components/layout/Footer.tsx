'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { popularConverters, popularCities, popularMeetings } from '@/data/seoLinks';
import styles from './layout.module.css';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const t = useTranslations('footer');

  const openCookieSettings = () => {
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('open-cookie-settings'));
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerColumns}>
          <div className={styles.footerColumn}>
            <h3 className={styles.footerColumnTitle}>{t('productTitle')}</h3>
            <ul className={styles.footerLinks}>
              <li><Link href="/" className={styles.footerLink}>{t('home')}</Link></li>
              <li><Link href="/explore" className={styles.footerLink}>{t('exploreGlobe')}</Link></li>
              <li><Link href="/compare" className={styles.footerLink}>{t('compareZones')}</Link></li>
              <li><Link href="/planner" className={styles.footerLink}>{t('meetingPlanner')}</Link></li>
              <li><Link href="/time-zone-converter" className={styles.footerLink}>{t('timeConverter')}</Link></li>
            </ul>
          </div>

          <div className={styles.footerColumn}>
            <h3 className={styles.footerColumnTitle}>{t('exploreTitle')}</h3>
            <ul className={styles.footerLinks}>
              <li><Link href="/time" className={styles.footerLink}>{t('worldClock')}</Link></li>
              <li><Link href="/convert" className={styles.footerLink}>{t('converters')}</Link></li>
              <li><Link href="/meeting" className={styles.footerLink}>{t('meetingTimes')}</Link></li>
              <li><Link href="/dst" className={styles.footerLink}>{t('daylightSaving')}</Link></li>
              <li><Link href="/blog" className={styles.footerLink}>{t('blog')}</Link></li>
            </ul>
          </div>

          <div className={styles.footerColumn}>
            <h3 className={styles.footerColumnTitle}>{t('popularTitle')}</h3>
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
            <h3 className={styles.footerColumnTitle}>{t('legalTitle')}</h3>
            <ul className={styles.footerLinks}>
              <li><Link href="/about" className={styles.footerLink}>{t('about')}</Link></li>
              <li><Link href="/contact" className={styles.footerLink}>{t('contact')}</Link></li>
              <li><Link href="/privacy" className={styles.footerLink}>{t('privacy')}</Link></li>
              <li><Link href="/terms" className={styles.footerLink}>{t('terms')}</Link></li>
              <li>
                <button
                  type="button"
                  onClick={openCookieSettings}
                  className={styles.footerLink}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit', textAlign: 'left' }}
                >
                  {t('cookieSettings')}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <div className={styles.footerBottomLeft}>
            <p className={styles.footerCopyright}>
              {t('copyright', { year: currentYear })}
            </p>
            <p className={styles.footerLegal}>
              {t('disclaimer')}
            </p>
          </div>
          <div className={styles.footerBottomRight}>
            <Link href="/privacy" className={styles.footerBottomLink}>{t('privacyShort')}</Link>
            <span className={styles.footerBottomDivider}>•</span>
            <Link href="/terms" className={styles.footerBottomLink}>{t('termsShort')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
