'use client';

import { useEffect } from 'react';
import styles from '@/components/layout/layout.module.css';
import ui from '@/components/ui/ui.module.css';
import termsStyles from './terms.module.css';
import { TopBar } from '@/components/layout/TopBar';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

export default function TermsPage() {
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
          name: 'Terms of Service',
          item: `${baseUrl}/terms`,
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
      <div className={termsStyles.content}>
        <div className={ui.card}>
          <div className={`${ui.cardBody} ${termsStyles.contentBody}`}>
            <div style={{ marginBottom: '24px' }}>
              <Link 
                href="/" 
                className={termsStyles.backLink}
              >
                <span className={termsStyles.backArrow}>←</span>
                <span>Back to Home</span>
              </Link>
            </div>

            <header style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
              <h1 className={ui.title} style={{ fontSize: '32px', marginBottom: '12px', lineHeight: '1.2' }}>
                Terms of Service
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                Last updated: 09.01.2026
              </p>
            </header>

            <article className={termsStyles.articleContent}>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '32px' }}>
                These Terms of Service ("Terms") govern your access to and use of this website (the "Website"). By accessing or using the Website, you agree to be bound by these Terms. If you do not agree, please discontinue use of the Website.
              </p>

              <section style={{ marginBottom: '32px' }}>
                <h2 className={termsStyles.sectionTitle}>1. Purpose of the Website</h2>
                <p className={termsStyles.paragraph}>
                  The Website provides tools and information related to time zones, time differences, UTC conversions, and meeting planning for general informational purposes only.
                </p>
                <p className={termsStyles.paragraph}>
                  The Website does not provide legal, financial, professional, or time-critical advisory services.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 className={termsStyles.sectionTitle}>2. Use of the Website</h2>
                <p className={termsStyles.paragraph}>
                  You agree to use the Website only for lawful purposes and in a manner that does not:
                </p>
                <ul className={termsStyles.list}>
                  <li>Violate applicable laws or regulations</li>
                  <li>Infringe the rights of others</li>
                  <li>Interfere with or disrupt the operation of the Website</li>
                  <li>Attempt to gain unauthorized access to any part of the Website</li>
                </ul>
                <p className={termsStyles.paragraph}>
                  We reserve the right to restrict or terminate access to the Website at any time if misuse is detected.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 className={termsStyles.sectionTitle}>3. Accuracy of Information</h2>
                <p className={termsStyles.paragraph}>
                  While we make reasonable efforts to ensure that the information and calculations provided on the Website are accurate and based on recognized public time zone data, we do not guarantee that the content is complete, current, or error-free.
                </p>
                <p className={termsStyles.paragraph}>
                  Time zone rules and daylight saving time practices may change due to governmental or regulatory decisions. You acknowledge that any reliance on the information provided is at your own risk.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 className={termsStyles.sectionTitle}>4. No Warranty</h2>
                <p className={termsStyles.paragraph}>
                  The Website and all content and tools are provided on an "as is" and "as available" basis.
                </p>
                <p className={termsStyles.paragraph}>
                  To the fullest extent permitted by applicable law, we disclaim all warranties, whether express or implied, including but not limited to implied warranties of accuracy, reliability, fitness for a particular purpose, and non-infringement.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 className={termsStyles.sectionTitle}>5. Limitation of Liability</h2>
                <p className={termsStyles.paragraph}>
                  To the extent permitted by applicable European Union law, we shall not be liable for any direct, indirect, incidental, consequential, or special damages arising out of or in connection with your use of, or inability to use, the Website or reliance on its content.
                </p>
                <p className={termsStyles.paragraph}>
                  This includes, without limitation, loss of data, loss of business, missed meetings, or scheduling errors.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 className={termsStyles.sectionTitle}>6. Intellectual Property</h2>
                <p className={termsStyles.paragraph}>
                  All content on the Website, including text, design, layout, logos, and software, is the property of the Website owner or its licensors and is protected by applicable intellectual property laws.
                </p>
                <p className={termsStyles.paragraph}>
                  You may use the Website for personal and non-commercial purposes. You may not copy, reproduce, distribute, modify, or exploit any part of the Website without prior written permission, except where permitted by law.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 className={termsStyles.sectionTitle}>7. Third-Party Services and Advertising</h2>
                <p className={termsStyles.paragraph}>
                  The Website may display advertisements or include links to third-party websites or services.
                </p>
                <p className={termsStyles.paragraph}>
                  We do not control and are not responsible for the content, availability, or practices of third-party websites. Your interaction with third-party services is governed by their respective terms and privacy policies.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 className={termsStyles.sectionTitle}>8. Privacy and Data Protection</h2>
                <p className={termsStyles.paragraph}>
                  Your use of the Website is also governed by our <Link href="/privacy" className={termsStyles.internalLink}>Privacy Policy</Link>, which explains how personal data is processed in accordance with applicable data protection laws, including the GDPR.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 className={termsStyles.sectionTitle}>9. Changes to the Website or Terms</h2>
                <p className={termsStyles.paragraph}>
                  We may update, modify, suspend, or discontinue any part of the Website at any time without prior notice.
                </p>
                <p className={termsStyles.paragraph}>
                  We may also update these Terms from time to time. Any changes will be effective once posted on this page, with the "Last updated" date revised accordingly.
                </p>
                <p className={termsStyles.paragraph}>
                  Continued use of the Website after changes constitutes acceptance of the updated Terms.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 className={termsStyles.sectionTitle}>10. Governing Law and Jurisdiction</h2>
                <p className={termsStyles.paragraph}>
                  These Terms shall be governed by and construed in accordance with the laws of the European Union and, where applicable, the laws of the country in which the Website operator is established.
                </p>
                <p className={termsStyles.paragraph}>
                  Nothing in these Terms limits your statutory rights as a consumer under applicable EU law.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 className={termsStyles.sectionTitle}>11. Severability</h2>
                <p className={termsStyles.paragraph}>
                  If any provision of these Terms is found to be unlawful, invalid, or unenforceable, the remaining provisions shall remain in full force and effect.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 className={termsStyles.sectionTitle}>12. Contact Information</h2>
                <p className={termsStyles.paragraph}>
                  If you have any questions regarding these Terms of Service, you may contact us at:
                </p>
                <p className={termsStyles.paragraph} style={{ marginTop: '12px' }}>
                  <strong>Email:</strong> <a href="mailto:hello@affsquad.com" className={termsStyles.emailLink}>hello@affsquad.com</a>
                </p>
              </section>
            </article>

            <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
              <Link 
                href="/" 
                className={`${ui.btnPrimary} ${termsStyles.backButton}`}
              >
                <span className={termsStyles.backButtonArrow}>←</span>
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

