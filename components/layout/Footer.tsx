'use client';

import Link from 'next/link';
import { popularConverters, popularCities, popularMeetings } from '@/data/seoLinks';
import styles from './layout.module.css';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerColumns}>
          <div className={styles.footerColumn}>
            <h3 className={styles.footerColumnTitle}>PRODUCT</h3>
            <ul className={styles.footerLinks}>
              <li>
                <Link href="/" className={styles.footerLink}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className={styles.footerLink}>
                  About
                </Link>
              </li>
            </ul>
          </div>

          <div className={styles.footerColumn}>
            <h3 className={styles.footerColumnTitle}>LEGAL</h3>
            <ul className={styles.footerLinks}>
              <li>
                <Link href="/privacy" className={styles.footerLink}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className={styles.footerLink}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className={styles.footerLink}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className={styles.footerColumn}>
            <h3 className={styles.footerColumnTitle}>RESOURCES</h3>
            <ul className={styles.footerLinks}>
              <li>
                <Link href="/blog" className={styles.footerLink}>
                  Blog
                </Link>
              </li>
              {popularConverters.slice(0, 3).map((item) => (
                <li key={item.slug}>
                  <Link href={`/convert/${item.slug}`} className={styles.footerLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
              {popularCities.slice(0, 3).map((item) => (
                <li key={item.slug}>
                  <Link href={`/time/${item.slug}`} className={styles.footerLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
              {popularMeetings.slice(0, 2).map((item) => (
                <li key={item.slug}>
                  <Link href={`/meeting/${item.slug}`} className={styles.footerLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <div className={styles.footerBottomLeft}>
            <p className={styles.footerCopyright}>
              © {currentYear} Timezio. All rights reserved.
            </p>
            <p className={styles.footerLegal}>
              Information on this website is provided for general reference only. Accuracy is not guaranteed. No liability is accepted to the extent permitted by EU law. Cookies or similar technologies may be used for analytics in accordance with GDPR.
            </p>
          </div>
          <div className={styles.footerBottomRight}>
            <Link href="/privacy" className={styles.footerBottomLink}>
              Privacy
            </Link>
            <span className={styles.footerBottomDivider}>•</span>
            <Link href="/terms" className={styles.footerBottomLink}>
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

