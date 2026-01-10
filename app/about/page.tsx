'use client';

import { useEffect } from 'react';
import styles from '@/components/layout/layout.module.css';
import ui from '@/components/ui/ui.module.css';
import aboutStyles from './about.module.css';
import { TopBar } from '@/components/layout/TopBar';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

export default function AboutPage() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const baseUrl = 'https://timezio.com';
    
    // Add breadcrumb structured data
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${baseUrl}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'About',
          item: `${baseUrl}/about`,
        },
      ],
    };

    // Add FAQPage structured data
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What time zone data does this website use?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'This website uses official IANA time zone definitions, which are the global standard for accurate time calculations.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does the website account for daylight saving time?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. All calculations automatically adjust for daylight saving time based on the selected date and location.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I check future or past dates?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. You can select any date and time to see how time differences change throughout the year.',
          },
        },
        {
          '@type': 'Question',
          name: 'Why does the time difference change during the year?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Time differences change because some regions observe daylight saving time while others do not, or they change clocks on different dates.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is this website free to use?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. All tools on this website are completely free to use and require no registration.',
          },
        },
        {
          '@type': 'Question',
          name: 'How accurate are the results?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Results are accurate to the minute and based on official time zone rules, but should not be used for legal or critical decisions without verification.',
          },
        },
      ],
    };

    // Remove existing scripts
    ['breadcrumb-schema', 'faq-schema'].forEach(id => {
      const existing = document.getElementById(id);
      if (existing) existing.remove();
    });

    // Add breadcrumb schema
    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.id = 'breadcrumb-schema';
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.text = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(breadcrumbScript);

    // Add FAQ schema
    const faqScript = document.createElement('script');
    faqScript.id = 'faq-schema';
    faqScript.type = 'application/ld+json';
    faqScript.text = JSON.stringify(faqSchema);
    document.head.appendChild(faqScript);

    return () => {
      ['breadcrumb-schema', 'faq-schema'].forEach(id => {
        const script = document.getElementById(id);
        if (script) document.head.removeChild(script);
      });
    };
  }, []);

  return (
    <div className={styles.layout}>
      <TopBar />
      <div className={aboutStyles.content}>
        <div className={ui.card}>
          <div className={`${ui.cardBody} ${aboutStyles.contentBody}`}>
            <h1 className={ui.title} style={{ fontSize: '28px', marginBottom: '8px' }}>
              About This Website
            </h1>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
              This website was created to make working across time zones simple, accurate, and stress-free.
              Whether you're planning a meeting with colleagues abroad, checking the current time in another city,
              converting UTC, or traveling across countries, our tools help you instantly understand time differences
              without confusion.
            </p>

            <div style={{ marginBottom: '32px' }}>
              <h2 className={ui.title} style={{ fontSize: '20px', marginBottom: '16px' }}>
                Core Principles
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Accuracy
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                    All calculations are based on official IANA time zone data and are fully daylight-saving-time (DST) aware.
                  </p>
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Simplicity
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                    Clean, fast tools that work instantly without unnecessary steps.
                  </p>
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Reliability
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                    Built for daily use by professionals, travelers, remote teams, and digital nomads.
                  </p>
                </div>
              </div>
            </div>

            <div className={ui.divider} />

            <div style={{ marginBottom: '32px' }}>
              <h2 className={ui.title} style={{ fontSize: '20px', marginBottom: '12px' }}>
                Automatic Calculations
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '12px' }}>
                Our calculators automatically account for:
              </p>
              <ul style={{ 
                fontSize: '14px', 
                color: 'var(--text-secondary)', 
                lineHeight: '1.8',
                margin: 0,
                paddingLeft: '20px'
              }}>
                <li>Daylight saving time changes</li>
                <li>Different UTC offsets</li>
                <li>Date changes when crossing time zones</li>
                <li>Regions with non-standard offsets (such as 30- or 45-minute differences)</li>
              </ul>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '12px', marginBottom: 0 }}>
                This website is designed to be useful worldwide and is updated regularly to reflect official time zone rules.
              </p>
            </div>

            <div className={ui.divider} />

            <div style={{ marginBottom: '32px' }}>
              <h2 className={ui.title} style={{ fontSize: '20px', marginBottom: '16px' }}>
                Who This Website Is For
              </h2>
              <ul style={{ 
                fontSize: '14px', 
                color: 'var(--text-secondary)', 
                lineHeight: '1.8',
                margin: 0,
                paddingLeft: '20px'
              }}>
                <li>Remote workers and distributed teams</li>
                <li>Business professionals scheduling international meetings</li>
                <li>Travelers and frequent flyers</li>
                <li>Students and educators</li>
                <li>Anyone who needs to convert or compare time zones accurately</li>
              </ul>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '16px', marginBottom: 0, fontWeight: 600 }}>
                No accounts. No complexity. Just clear answers.
              </p>
            </div>

            <div className={ui.divider} />

            <div style={{ marginBottom: '32px' }}>
              <h2 className={ui.title} style={{ fontSize: '20px', marginBottom: '16px' }}>
                How to Use This Website
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    1. Explore — Interactive Globe
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '8px' }}>
                    Click anywhere on the 3D globe to instantly see the local time for that location.
                  </p>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                    <strong>How it works:</strong> Click a location on the globe or search for a city. View the current time,
                    UTC offset, and DST status. Perfect for quick checks and exploring time zones visually.
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    2. Compare — Time Zone Comparison
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '8px' }}>
                    Compare time differences between multiple cities simultaneously.
                  </p>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                    <strong>How it works:</strong> Add up to 6 cities to compare. Select a base city to see time differences
                    relative to it. Instantly see current local times, offsets, and visual comparisons. This is ideal for
                    answering questions like "When it's 9:00 AM in Berlin, what time is it in New York?"
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    3. Planner — Meeting Planner
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '8px' }}>
                    Find the best meeting time for people in different locations.
                  </p>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                    <strong>How it works:</strong> Add participants by city, select a meeting date, and optionally adjust
                    working hours for each participant. View overlapping time windows and share the meeting details. This tool
                    automatically avoids early-morning or late-night hours when possible.
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    4. DST — Daylight Saving Time
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '8px' }}>
                    Track daylight saving time changes and transitions throughout the year.
                  </p>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                    <strong>How it works:</strong> View DST status for any location, see upcoming transitions, and understand
                    when clocks change. Check how DST affects time differences between regions.
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    5. Saved — Favorite Locations
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '8px' }}>
                    Save your frequently used locations for quick access.
                  </p>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                    <strong>How it works:</strong> Save locations you check often. Access them instantly without searching.
                    Your saved locations are stored locally in your browser.
                  </p>
                </div>
              </div>
            </div>

            <div className={ui.divider} />

            <div>
              <h2 className={ui.title} style={{ fontSize: '20px', marginBottom: '16px' }}>
                Frequently Asked Questions
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    What time zone data does this website use?
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                    We use official IANA time zone definitions, which are the global standard for accurate time calculations.
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Does the website account for daylight saving time?
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                    Yes. All calculations automatically adjust for daylight saving time based on the selected date and location.
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Can I check future or past dates?
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                    Yes. You can select any date and time to see how time differences change throughout the year.
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Why does the time difference change during the year?
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                    Time differences change because some regions observe daylight saving time while others do not, or they change clocks on different dates.
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Are cities with the same name supported?
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                    Yes. Cities are identified by both name and country to avoid confusion (for example, multiple cities named "Springfield").
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Is this website free to use?
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                    Yes. All tools on this website are completely free to use and require no registration.
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Can I share or bookmark results?
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                    Yes. Tool pages generate clean, shareable URLs that you can bookmark or send to others using the "Copy link" button.
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    How accurate are the results?
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                    Results are accurate to the minute and based on official time zone rules, but should not be used for legal or critical decisions without verification.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ 
              marginTop: '32px', 
              paddingTop: '24px', 
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start'
            }}>
              <Link 
                href="/" 
                className={`${ui.btnPrimary} ${aboutStyles.backButton}`}
              >
                <span className={aboutStyles.backButtonArrow}>←</span>
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

