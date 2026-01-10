'use client';

import { useEffect } from 'react';

type FAQItem = {
  question: string;
  answer: string;
};

type FAQSectionProps = {
  faqs: FAQItem[];
  id?: string;
};

export function FAQSection({ faqs, id = 'faq-schema' }: FAQSectionProps) {
  useEffect(() => {
    if (typeof window === 'undefined' || faqs.length === 0) return;

    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };

    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(faqSchema);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById(id);
      if (scriptToRemove) document.head.removeChild(scriptToRemove);
    };
  }, [faqs, id]);

  if (faqs.length === 0) return null;

  return (
    <div style={{ marginTop: '32px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
        Frequently Asked Questions
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {faqs.map((faq, idx) => (
          <div key={idx} style={{ padding: '16px', background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              {faq.question}
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

