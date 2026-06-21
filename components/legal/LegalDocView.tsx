import type { ReactNode } from 'react';
import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import styles from '@/components/layout/layout.module.css';
import ui from '@/components/ui/ui.module.css';
import { TopBar } from '@/components/layout/TopBar';
import { Footer } from '@/components/layout/Footer';
import { defaultLocale } from '@/i18n/routing';

// Structured legal/info document. Block text supports lightweight inline markup:
//   **bold**            -> <strong>
//   [label](/path)      -> locale-aware internal link
//   [label](https://…)  -> external link (new tab)
//   [label](mailto:…)   -> email link
export type LegalBlock =
  | { type: 'p'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'note'; text: string }
  | { type: 'emailBox'; label: string; email: string };

export type LegalSection = { heading?: string; blocks: LegalBlock[] };

export type LegalDoc = {
  title: string;
  updated?: string;
  intro: LegalBlock[];
  sections: LegalSection[];
};

const INLINE = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;

function Inline({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  INLINE.lastIndex = 0;
  while ((m = INLINE.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      nodes.push(<strong key={key++}>{m[1]}</strong>);
    } else {
      const label = m[2];
      const href = m[3];
      if (href.startsWith('/')) {
        nodes.push(<Link key={key++} href={href} className={ui.link}>{label}</Link>);
      } else {
        nodes.push(
          <a
            key={key++}
            href={href}
            target={href.startsWith('mailto:') ? undefined : '_blank'}
            rel="noopener noreferrer"
            className={ui.link}
          >
            {label}
          </a>
        );
      }
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
}

const pStyle = { color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 12px', fontSize: '15px' } as const;

function Block({ block }: { block: LegalBlock }) {
  switch (block.type) {
    case 'subheading':
      return (
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: '18px 0 8px' }}>
          <Inline text={block.text} />
        </h3>
      );
    case 'list':
      return (
        <ul style={{ ...pStyle, paddingLeft: '20px', display: 'grid', gap: '6px' }}>
          {block.items.map((it, i) => (
            <li key={i}><Inline text={it} /></li>
          ))}
        </ul>
      );
    case 'note':
      return (
        <p style={{ ...pStyle, padding: '16px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
          <Inline text={block.text} />
        </p>
      );
    case 'emailBox':
      return (
        <div style={{ margin: '16px 0', padding: '20px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '15px', color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>{block.label}</strong>
          </p>
          <a href={`mailto:${block.email}`} className={ui.link} style={{ fontSize: '18px', fontWeight: 600 }}>
            {block.email}
          </a>
        </div>
      );
    default:
      return <p style={pStyle}><Inline text={block.text} /></p>;
  }
}

export async function LegalDocView({ doc }: { doc: LegalDoc }) {
  const locale = await getLocale();
  const tc = await getTranslations('common');

  return (
    <div className={styles.layout}>
      <TopBar />
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 20px', width: '100%' }}>
        <div className={ui.card}>
          <div className={ui.cardBody}>
            <div style={{ marginBottom: '24px' }}>
              <Link href="/" className={ui.link}>← {tc('backToHome')}</Link>
            </div>

            <header style={{ marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
              <h1 className={ui.title} style={{ fontSize: '32px', marginBottom: '12px', lineHeight: 1.2 }}>{doc.title}</h1>
              {doc.updated && <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>{doc.updated}</p>}
            </header>

            {locale !== defaultLocale && (
              <p style={{ ...pStyle, fontStyle: 'italic', padding: '12px 14px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                {tc('legalDisclaimer')}
              </p>
            )}

            <article>
              {doc.intro?.map((b, i) => <Block key={`intro-${i}`} block={b} />)}
              {doc.sections.map((sec, si) => (
                <section key={si} style={{ marginBottom: '28px' }}>
                  {sec.heading && (
                    <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 12px' }}>
                      {sec.heading}
                    </h2>
                  )}
                  {sec.blocks.map((b, bi) => <Block key={bi} block={b} />)}
                </section>
              ))}
            </article>

            <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
              <Link href="/" className={ui.btnPrimary} style={{ display: 'inline-block', padding: '10px 16px', borderRadius: '9px', textDecoration: 'none' }}>
                ← {tc('backToHome')}
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
