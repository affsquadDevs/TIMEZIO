'use client';

import { useEffect } from 'react';
import styles from '@/components/layout/layout.module.css';
import ui from '@/components/ui/ui.module.css';
import contactStyles from './contact.module.css';
import { TopBar } from '@/components/layout/TopBar';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

export default function ContactPage() {
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
          name: 'Contact Us',
          item: `${baseUrl}/contact`,
        },
      ],
    };

    // Add ContactPage structured data
    const contactSchema = {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      mainEntity: {
        '@type': 'Organization',
        name: 'Timezio',
        email: 'hello@timezio.com',
      },
    };

    const breadcrumbScriptId = 'breadcrumb-schema';
    const contactScriptId = 'contact-schema';
    
    // Remove existing scripts
    [breadcrumbScriptId, contactScriptId].forEach(id => {
      const existing = document.getElementById(id);
      if (existing) existing.remove();
    });

    // Add breadcrumb schema
    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.id = breadcrumbScriptId;
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.text = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(breadcrumbScript);

    // Add contact schema
    const contactScript = document.createElement('script');
    contactScript.id = contactScriptId;
    contactScript.type = 'application/ld+json';
    contactScript.text = JSON.stringify(contactSchema);
    document.head.appendChild(contactScript);

    return () => {
      [breadcrumbScriptId, contactScriptId].forEach(id => {
        const script = document.getElementById(id);
        if (script) document.head.removeChild(script);
      });
    };
  }, []);

  return (
    <div className={styles.layout}>
      <TopBar />
      <div className={contactStyles.content}>
        <div className={ui.card}>
          <div className={`${ui.cardBody} ${contactStyles.contentBody}`}>
            <div style={{ marginBottom: '24px' }}>
              <Link 
                href="/" 
                className={contactStyles.backLink}
              >
                <span className={contactStyles.backArrow}>←</span>
                <span>Back to Home</span>
              </Link>
            </div>

            <header style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
              <h1 className={ui.title} style={{ fontSize: '32px', marginBottom: '16px', lineHeight: '1.2' }}>
                Contact Us
              </h1>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: '1.7', margin: 0 }}>
                We value your feedback and are happy to hear from you.
              </p>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: '1.7', marginTop: '12px', marginBottom: 0 }}>
                If you have questions about how our tools work, would like to report an issue, or want to share suggestions for improvement, please feel free to get in touch.
              </p>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7', marginTop: '12px', marginBottom: 0 }}>
                Timezio is operated by <strong>AffSquad</strong>, an independent studio that builds free web utilities.
              </p>
            </header>

            <article className={contactStyles.articleContent}>
              <section style={{ marginBottom: '32px' }}>
                <h2 className={contactStyles.sectionTitle}>How to Contact Us</h2>
                <p className={contactStyles.paragraph}>
                  You can contact us by email:
                </p>
                <div style={{ 
                  marginTop: '16px', 
                  marginBottom: '16px',
                  padding: '20px',
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px'
                }}>
                  <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Email:</strong>
                  </p>
                  <a href="mailto:hello@timezio.com" className={contactStyles.emailLink} style={{ fontSize: '18px', fontWeight: 600 }}>
                    hello@timezio.com
                  </a>
                </div>
                <p className={contactStyles.paragraph}>
                  We aim to respond to messages within a reasonable time. Please note that response times may vary depending on the volume of inquiries.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 className={contactStyles.sectionTitle}>What You Can Contact Us About</h2>
                <p className={contactStyles.paragraph}>
                  You may contact us regarding:
                </p>
                <ul className={contactStyles.list}>
                  <li>Questions about time zone calculations or tool functionality</li>
                  <li>Reporting incorrect or outdated information</li>
                  <li>Technical issues or bugs on the website</li>
                  <li>General feedback and improvement suggestions</li>
                </ul>
                <p className={contactStyles.paragraph} style={{ marginTop: '16px', padding: '16px', background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <strong>Please note:</strong> We are unable to provide personalized scheduling advice, legal guidance, or time-critical confirmations.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 className={contactStyles.sectionTitle}>Personal Data and Privacy</h2>
                <p className={contactStyles.paragraph}>
                  If you contact us by email, we will process any personal data you provide (such as your email address and message content) solely for the purpose of responding to your inquiry.
                </p>
                <p className={contactStyles.paragraph}>
                  Your information will be handled in accordance with applicable data protection laws, including the General Data Protection Regulation (EU) 2016/679 (GDPR).
                </p>
                <p className={contactStyles.paragraph}>
                  For more details, please refer to our <Link href="/privacy" className={contactStyles.internalLink}>Privacy Policy</Link>.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 className={contactStyles.sectionTitle}>Important Notice</h2>
                <p className={contactStyles.paragraph} style={{ 
                  padding: '20px', 
                  background: 'var(--card-bg)', 
                  borderRadius: '12px', 
                  border: '2px solid var(--border-color)',
                  fontWeight: 500
                }}>
                  The information provided through this website and via email responses is for general informational purposes only and should not be relied upon for legal, financial, aviation, or other time-critical decisions.
                </p>
              </section>
            </article>

            <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
              <Link 
                href="/" 
                className={`${ui.btnPrimary} ${contactStyles.backButton}`}
              >
                <span className={contactStyles.backButtonArrow}>←</span>
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

