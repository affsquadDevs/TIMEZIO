'use client';

import { useEffect } from 'react';
import styles from '@/components/layout/layout.module.css';
import ui from '@/components/ui/ui.module.css';
import privacyStyles from './privacy.module.css';
import { TopBar } from '@/components/layout/TopBar';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

export default function PrivacyPage() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const baseUrl = 'https://www.timezio.com';
    
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
          name: 'Privacy Policy',
          item: `${baseUrl}/privacy`,
        },
      ],
    };

    const scriptId = 'breadcrumb-schema';
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById(scriptId);
      if (scriptToRemove) {
        document.head.removeChild(scriptToRemove);
      }
    };
  }, []);

  return (
    <div className={styles.layout}>
      <TopBar />
      <div className={privacyStyles.content}>
        <div className={ui.card}>
          <div className={`${ui.cardBody} ${privacyStyles.contentBody}`}>
            <div style={{ marginBottom: '24px' }}>
              <Link 
                href="/" 
                className={privacyStyles.backLink}
              >
                <span className={privacyStyles.backArrow}>←</span>
                <span>Back to Home</span>
              </Link>
            </div>

            <header style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
              <h1 className={ui.title} style={{ fontSize: '32px', marginBottom: '12px', lineHeight: '1.2' }}>
                Privacy Policy
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                Last updated: 09.01.2026
              </p>
            </header>

            <article className={privacyStyles.articleContent}>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '24px' }}>
                This Privacy Policy explains how we collect, use, and protect information when you visit and use this website (the "Website").
              </p>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '32px' }}>
                We are committed to protecting your privacy and processing personal data in accordance with applicable data protection laws, including the General Data Protection Regulation (EU) 2016/679 (GDPR).
              </p>

              <section style={{ marginBottom: '32px' }}>
                <h2 className={privacyStyles.sectionTitle}>1. Information We Collect</h2>
                
                <h3 className={privacyStyles.subsectionTitle}>1.1 Information You Do Not Provide Directly</h3>
                <p className={privacyStyles.paragraph}>
                  This Website does not require user registration and does not ask users to provide personal information to use its core features.
                </p>

                <h3 className={privacyStyles.subsectionTitle}>1.2 Automatically Collected Information</h3>
                <p className={privacyStyles.paragraph}>
                  When you visit the Website, limited information may be collected automatically, including:
                </p>
                <ul className={privacyStyles.list}>
                  <li>IP address (anonymized/truncated where supported by the tool)</li>
                  <li>Browser type and version</li>
                  <li>Device type and operating system</li>
                  <li>Pages visited and interaction data</li>
                  <li>Referring website</li>
                  <li>Approximate geographic location (city or country level)</li>
                </ul>
                <p className={privacyStyles.paragraph}>
                  This information is used only for analytics, security, and service improvement purposes.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h3 className={privacyStyles.subsectionTitle}>1.3 Service Data You May Provide</h3>
                <p className={privacyStyles.paragraph}>
                  Core tools (time conversion, planner) work without registration. If you choose to save/share meeting data, connect a calendar, or sign in with Google, we may store the meeting/session details you submit (e.g., participant names or labels, time slots, titles) and your Google account email to enable the feature. You can request deletion of this stored data at any time (see Contact).
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 className={privacyStyles.sectionTitle}>2. Cookies and Similar Technologies</h2>
                <p className={privacyStyles.paragraph}>
                  The Website may use cookies or similar technologies to:
                </p>
                <ul className={privacyStyles.list}>
                  <li>Measure traffic and usage patterns</li>
                  <li>Understand how users interact with the Website</li>
                  <li>Improve performance and user experience</li>
                  <li>Show advertising where enabled</li>
                </ul>
                <p className={privacyStyles.paragraph}>
                  Cookies used on this Website do not directly identify you as an individual.
                </p>
                <p className={privacyStyles.paragraph}>
                  Where required by applicable law, cookies that are not strictly necessary are used only after obtaining user consent through a cookie banner or consent mechanism.
                </p>
                <p className={privacyStyles.paragraph}>
                  You can manage or withdraw your consent at any time through your browser settings or the cookie settings provided on the Website.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 className={privacyStyles.sectionTitle}>3. Analytics and Advertising</h2>
                
                <h3 className={privacyStyles.subsectionTitle}>3.1 Analytics</h3>
                <p className={privacyStyles.paragraph}>
                  We may use analytics tools (e.g., Google Analytics via Google Tag Manager or privacy-focused alternatives) to understand how visitors use the Website. These tools collect usage data (pages viewed, device/browser info, approximate location) and can be configured to anonymize IP where supported. Non-essential analytics only load after consent where required.
                </p>

                <h3 className={privacyStyles.subsectionTitle}>3.2 Advertising</h3>
                <p className={privacyStyles.paragraph}>
                  The Website may display advertisements from third-party partners such as Google AdSense (served via Google Tag Manager). These partners may use cookies or similar technologies to display relevant ads and may process data (e.g., cookie IDs, coarse location, device info). Advertising cookies are loaded only after consent where required.
                </p>
                <p className={privacyStyles.paragraph}>
                  Advertising partners process information under their own privacy policies and may transfer data outside your region under appropriate safeguards (e.g., Standard Contractual Clauses). You can withdraw or change your cookie and advertising consent at any time using the <strong>&ldquo;Cookie settings&rdquo;</strong> link in the website footer, or through your browser settings.
                </p>
                <p className={privacyStyles.paragraph}>
                  You can also control or opt out of personalized advertising directly with the providers and industry programs:
                </p>
                <ul className={privacyStyles.list}>
                  <li>Google Ads Settings — <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className={privacyStyles.emailLink}>adssettings.google.com</a></li>
                  <li>How Google uses data from partner sites — <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className={privacyStyles.emailLink}>policies.google.com/technologies/partner-sites</a></li>
                  <li>US opt-out (DAA) — <a href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer" className={privacyStyles.emailLink}>optout.aboutads.info</a> · <a href="https://www.youradchoices.com" target="_blank" rel="noopener noreferrer" className={privacyStyles.emailLink}>youradchoices.com</a></li>
                  <li>EU opt-out (EDAA) — <a href="https://www.youronlinechoices.eu" target="_blank" rel="noopener noreferrer" className={privacyStyles.emailLink}>youronlinechoices.eu</a></li>
                </ul>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 className={privacyStyles.sectionTitle}>4. How We Use Information</h2>
                <p className={privacyStyles.paragraph}>
                  Collected information may be used to:
                </p>
                <ul className={privacyStyles.list}>
                  <li>Operate and maintain the Website</li>
                  <li>Improve tools, features, and usability</li>
                  <li>Analyze usage trends and performance</li>
                  <li>Ensure security and prevent abuse</li>
                  <li>Comply with legal obligations</li>
                </ul>
                <p className={privacyStyles.paragraph}>
                  <strong>We do not sell personal data.</strong>
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 className={privacyStyles.sectionTitle}>5. Legal Basis for Processing (GDPR)</h2>
                <p className={privacyStyles.paragraph}>
                  Under the GDPR, personal data is processed on the following legal bases:
                </p>
                <ul className={privacyStyles.list}>
                  <li><strong>Consent</strong> — for non-essential cookies/analytics/advertising where required</li>
                  <li><strong>Legitimate interests</strong> — to operate, secure, and improve the Website</li>
                  <li><strong>Legal obligation</strong> — where processing is required by law</li>
                </ul>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 className={privacyStyles.sectionTitle}>6. Data Retention</h2>
                <p className={privacyStyles.paragraph}>
                  We retain collected data only for as long as necessary to fulfill the purposes described in this Privacy Policy, unless a longer retention period is required or permitted by law.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 className={privacyStyles.sectionTitle}>7. Data Sharing and Third Parties</h2>
                <p className={privacyStyles.paragraph}>
                  We may share limited data with trusted third-party service providers (such as analytics or advertising providers) strictly for the purposes described in this Privacy Policy.
                </p>
                <p className={privacyStyles.paragraph}>
                  All such providers are required to process data in compliance with applicable data protection laws.
                </p>
                <p className={privacyStyles.paragraph}>
                  Some providers (e.g., Google) may process data outside the European Economic Area (EEA). When that occurs, we rely on appropriate safeguards such as Standard Contractual Clauses or equivalent mechanisms.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 className={privacyStyles.sectionTitle}>8. Your Rights Under GDPR</h2>
                <p className={privacyStyles.paragraph}>
                  If you are located in the European Union, you have the right to:
                </p>
                <ul className={privacyStyles.list}>
                  <li>Access your personal data</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Restrict or object to processing</li>
                  <li>Withdraw consent at any time</li>
                  <li>Lodge a complaint with a supervisory authority</li>
                </ul>
                <p className={privacyStyles.paragraph}>
                  You may exercise these rights by contacting us using the details provided below.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 className={privacyStyles.sectionTitle}>9. US State Privacy Rights (CCPA / CPRA & similar)</h2>
                <p className={privacyStyles.paragraph}>
                  If you are a resident of California or another US state with comprehensive privacy laws, you may have the right to know what personal information is collected, to request access or deletion, to correct inaccurate information, and to opt out of the &ldquo;sale&rdquo; or &ldquo;sharing&rdquo; of personal information and of targeted advertising.
                </p>
                <p className={privacyStyles.paragraph}>
                  We do not sell personal information for money. However, the use of advertising cookies may be considered &ldquo;sharing&rdquo; or a &ldquo;sale&rdquo; under some state laws. You can opt out of personalized advertising using the <strong>&ldquo;Cookie settings&rdquo;</strong> link in the footer and the industry opt-out tools listed in Section 3.2. Where supported, we honor the Global Privacy Control (GPC) browser signal as a valid opt-out request.
                </p>
                <p className={privacyStyles.paragraph}>
                  To exercise any of these rights, contact us using the details in Section 14. We will not discriminate against you for exercising your privacy rights.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 className={privacyStyles.sectionTitle}>10. Children's Privacy</h2>
                <p className={privacyStyles.paragraph}>
                  This Website is not intended for children under the age of 16. We do not knowingly collect personal data from children.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 className={privacyStyles.sectionTitle}>11. Security</h2>
                <p className={privacyStyles.paragraph}>
                  We take reasonable technical and organizational measures to protect information against unauthorized access, loss, misuse, or alteration. However, no method of transmission or storage is completely secure.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 className={privacyStyles.sectionTitle}>12. External Links</h2>
                <p className={privacyStyles.paragraph}>
                  The Website may contain links to third-party websites. We are not responsible for the content or privacy practices of those websites.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 className={privacyStyles.sectionTitle}>13. Changes to This Privacy Policy</h2>
                <p className={privacyStyles.paragraph}>
                  We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated "Last updated" date.
                </p>
                <p className={privacyStyles.paragraph}>
                  We encourage users to review this page periodically. If changes materially affect how we process your data, we will provide a clear notice (e.g., on this page or via the Website interface).
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 className={privacyStyles.sectionTitle}>14. Contact Information</h2>
                <p className={privacyStyles.paragraph}>
                  If you have questions about this Privacy Policy or how data is processed on this Website, you may contact us at:
                </p>
                <p className={privacyStyles.paragraph} style={{ marginTop: '12px' }}>
                  <strong>Email:</strong> <a href="mailto:hello@timezio.com" className={privacyStyles.emailLink}>hello@timezio.com</a>
                </p>
              </section>
            </article>

            <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
              <Link 
                href="/" 
                className={`${ui.btnPrimary} ${privacyStyles.backButton}`}
              >
                <span className={privacyStyles.backButtonArrow}>←</span>
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

