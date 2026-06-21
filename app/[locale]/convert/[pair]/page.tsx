import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import styles from '@/components/layout/layout.module.css';
import ui from '@/components/ui/ui.module.css';
import { PageStage } from '@/components/programmatic/PageStage';
import { JsonLd } from '@/components/seo/JsonLd';
import { FaqList, faqJsonLd, type FaqItem } from '@/components/seo/FaqList';
import { FactGrid } from '@/components/programmatic/FactGrid';
import { popularConverters } from '@/data/seoLinks';
import {
  parseConvertPair,
  buildConversionTable,
  offsetDiffHours,
  offsetDiffParts,
  getZoneFacts,
} from '@/lib/timeData';
import { SITE_URL, SITE_NAME, SITE_LOGO } from '@/lib/site';
import { findCityBySlug } from '@/utils/cityMapper';

export const revalidate = 1800;

type Params = { locale: string; pair: string };

export function generateStaticParams() {
  return popularConverters.map((c) => ({ pair: c.slug }));
}

export default async function ConvertPairPage({ params }: { params: Promise<Params> }) {
  const { locale, pair } = await params;
  setRequestLocale(locale);
  const parsed = parseConvertPair(pair);
  if (!parsed) notFound();

  const t = await getTranslations('prog.convert');
  const tc = await getTranslations('common');

  const { from, to } = parsed;
  const fromFacts = getZoneFacts(from.zone, locale);
  const toFacts = getZoneFacts(to.zone, locale);
  const table = buildConversionTable(from.zone, to.zone, locale);
  const diff = offsetDiffHours(from.zone, to.zone);
  const parts = offsetDiffParts(from.zone, to.zone);
  const url = `${SITE_URL}/convert/${pair}`;

  const heading = t('h1', { from: from.label, to: to.label });
  const summary = t('diffSummary', { dir: parts.dir, h: parts.h, m: parts.m, from: from.label, to: to.label });
  const example = table[3]; // the 9:00 row (hours = [0,3,6,9,...])

  const faqs: FaqItem[] = [
    { question: t('faq1q', { from: from.label, to: to.label }), answer: t('faq1a', { to: to.label, toFull: to.full, dir: parts.dir, from: from.label, fromFull: from.full, absH: Math.abs(diff) }) },
    { question: t('faq2q', { from: from.label, to: to.label }), answer: t('faq2a', { from: from.label, exampleFrom: example.from, exampleTo: example.to, to: to.label }) },
    { question: t('faq3q', { from: from.label, to: to.label }), answer: t('faq3a', { from: from.label, fromDst: fromFacts.observesDst ? 'yes' : 'no', fromOffset: fromFacts.offsetLabel, to: to.label, toDst: toFacts.observesDst ? 'yes' : 'no', toOffset: toFacts.offsetLabel }) },
    { question: t('faq4q', { from: from.label, to: to.label }), answer: t('faq4a') },
  ];

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: heading,
    description: t('wpDesc', { from: from.label, to: to.label, summary }),
    url,
    inLanguage: locale,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: tc('breadcrumbHome'), item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: t('breadcrumb'), item: `${SITE_URL}/convert` },
        { '@type': 'ListItem', position: 3, name: `${from.label} to ${to.label}`, item: url },
      ],
    },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL, logo: { '@type': 'ImageObject', url: SITE_LOGO } },
  };

  const fromCity = findCityBySlug(pair.split('-to-')[0]) ?? cityForZone(from.zone);
  const toCity = findCityBySlug(pair.split('-to-')[1]) ?? cityForZone(to.zone);
  const init = {
    tab: 'compare' as const,
    mode: 'compare' as const,
    locations: [
      { lat: fromCity.lat, lng: fromCity.lng, label: from.label },
      { lat: toCity.lat, lng: toCity.lng, label: to.label },
    ],
    focus: { lat: (fromCity.lat + toCity.lat) / 2, lng: (fromCity.lng + toCity.lng) / 2, altitude: 2.5 },
  };

  const related = popularConverters.filter((c) => c.slug !== pair).slice(0, 5);

  return (
    <>
      <JsonLd data={webPage} id="ld-webpage" />
      <JsonLd data={faqJsonLd(faqs)} id="ld-faq" />
      <PageStage init={init}>
        <div className={styles.infoSection}>
          <div className={styles.infoCardWrapper}>
            <div className={ui.card}>
              <div className={ui.cardBody}>
                <h1 className={ui.title} style={{ marginBottom: '8px', fontSize: '24px' }}>
                  {heading}
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
                  {summary} {t('introBody', { from: from.label, fromFull: from.full, to: to.label, toFull: to.full })}
                </p>

                <FactGrid
                  items={[
                    { label: from.label, value: `${fromFacts.nowTime} (${fromFacts.offsetLabel})` },
                    { label: to.label, value: `${toFacts.nowTime} (${toFacts.offsetLabel})` },
                    { label: t('factDifference'), value: diff === 0 ? t('diffNone') : `${Math.abs(diff)}h` },
                  ]}
                />

                <h2 className={ui.title} style={{ fontSize: '18px', margin: '22px 0 10px' }}>
                  {t('tableHeading', { from: from.label, to: to.label })}
                </h2>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr>
                        <th style={thStyle}>{from.label}</th>
                        <th style={thStyle}>{to.label}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {table.map((row, i) => (
                        <tr key={i}>
                          <td style={tdStyle}>{row.from}</td>
                          <td style={tdStyle}>
                            {row.to}
                            {row.dayNote !== 'same' && (
                              <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}> ({row.dayNote === 'next' ? t('dayNext') : t('dayPrev')})</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: '16px' }}>
                  {t.rich('crosslinks', {
                    compare: (c) => <Link href="/compare" className={ui.link}>{c}</Link>,
                    planner: (c) => <Link href="/planner" className={ui.link}>{c}</Link>,
                  })}
                </p>

                <div className={ui.divider} />
                <h2 className={ui.title} style={{ fontSize: '18px', marginBottom: '12px' }}>
                  {t('relatedHeading')}
                </h2>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '8px' }}>
                  {related.map((c) => (
                    <li key={c.slug}>
                      <Link href={`/convert/${c.slug}`} className={ui.link} style={{ fontSize: '14px' }}>
                        {c.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                <FaqList faqs={faqs} />
              </div>
            </div>
          </div>
        </div>
      </PageStage>
    </>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 10px',
  borderBottom: '2px solid var(--border-color)',
  color: 'var(--text-secondary)',
  fontWeight: 600,
};
const tdStyle: React.CSSProperties = {
  padding: '8px 10px',
  borderBottom: '1px solid var(--border-color)',
  color: 'var(--text-primary)',
};

// Fallback representative coordinates for a zone, for the globe focus only.
function cityForZone(zone: string): { lat: number; lng: number } {
  const map: Record<string, { lat: number; lng: number }> = {
    UTC: { lat: 51.4779, lng: -0.0015 },
    'America/New_York': { lat: 40.7128, lng: -74.006 },
    'America/Los_Angeles': { lat: 34.0522, lng: -118.2437 },
    'America/Chicago': { lat: 41.8781, lng: -87.6298 },
    'America/Denver': { lat: 39.7392, lng: -104.9903 },
    'Europe/Paris': { lat: 48.8566, lng: 2.3522 },
    'Asia/Kolkata': { lat: 28.6139, lng: 77.209 },
    'Asia/Tokyo': { lat: 35.6762, lng: 139.6503 },
    'Asia/Seoul': { lat: 37.5665, lng: 126.978 },
    'Asia/Singapore': { lat: 1.3521, lng: 103.8198 },
    'Australia/Sydney': { lat: -33.8688, lng: 151.2093 },
  };
  return map[zone] ?? { lat: 0, lng: 0 };
}
