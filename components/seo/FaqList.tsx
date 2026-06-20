// Server component: renders the visible FAQ markup in the initial HTML.
// FAQPage JSON-LD is emitted separately via <JsonLd /> on each page.
import { getTranslations } from 'next-intl/server';

export type FaqItem = { question: string; answer: string };

export async function FaqList({ faqs }: { faqs: FaqItem[] }) {
  if (!faqs.length) return null;
  const t = await getTranslations('common');
  return (
    <section style={{ marginTop: '32px' }} aria-label={t('faqTitle')}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
        {t('faqTitle')}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {faqs.map((faq, i) => (
          <div
            key={i}
            style={{ padding: '16px', background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              {faq.question}
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Build FAQPage JSON-LD from an FAQ list. */
export function faqJsonLd(faqs: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}
