import { notFound } from 'next/navigation';
import Link from 'next/link';
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
  formatDiffHours,
  getZoneFacts,
} from '@/lib/timeData';
import { SITE_URL, SITE_NAME, SITE_LOGO } from '@/lib/site';
import { findCityBySlug } from '@/utils/cityMapper';

export const revalidate = 1800;

type Params = { pair: string };

export function generateStaticParams() {
  return popularConverters.map((c) => ({ pair: c.slug }));
}

export default async function ConvertPairPage({ params }: { params: Promise<Params> }) {
  const { pair } = await params;
  const parsed = parseConvertPair(pair);
  if (!parsed) notFound();

  const { from, to } = parsed;
  const fromFacts = getZoneFacts(from.zone);
  const toFacts = getZoneFacts(to.zone);
  const table = buildConversionTable(from.zone, to.zone);
  const diff = offsetDiffHours(from.zone, to.zone);
  const diffText = formatDiffHours(diff);
  const path = `/convert/${pair}`;
  const url = `${SITE_URL}${path}`;

  const heading = `${from.label} to ${to.label} Time Converter`;
  const summary =
    diff === 0
      ? `${to.label} is currently ${diffText} ${from.label}.`
      : `${to.label} is currently ${diffText} ${from.label}.`;

  const faqs: FaqItem[] = [
    {
      question: `What is the time difference between ${from.label} and ${to.label}?`,
      answer: `Right now ${to.label} (${to.full}) is ${diffText} ${from.label} (${from.full}). The difference is ${diff === 0 ? 'zero hours' : `${Math.abs(diff)} hour${Math.abs(diff) === 1 ? '' : 's'}`} and can shift by an hour when either zone enters or leaves daylight saving time.`,
    },
    {
      question: `How do I convert ${from.label} to ${to.label}?`,
      answer: `Add the ${from.label} time to the offset difference. For example, 9:00 AM ${from.label} is ${table.find((r) => r.from === '9:00 AM')?.to ?? 'shown in the table above'} ${to.label}. The full hour-by-hour table on this page lists each conversion for the current date.`,
    },
    {
      question: `Does ${from.label} or ${to.label} use daylight saving time?`,
      answer: `${from.label} is currently ${fromFacts.observesDst ? 'in a region that observes DST' : 'on a fixed offset (no DST)'} (${fromFacts.offsetLabel}), and ${to.label} is ${toFacts.observesDst ? 'in a region that observes DST' : 'on a fixed offset (no DST)'} (${toFacts.offsetLabel}). The converter uses official IANA data and adjusts automatically.`,
    },
    {
      question: `Is this ${from.label} to ${to.label} converter accurate?`,
      answer: `Yes — conversions use the IANA time zone database, the same source operating systems use, and account for current daylight saving rules to the minute.`,
    },
  ];

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: heading,
    description: `Convert ${from.label} to ${to.label}. ${summary}`,
    url,
    inLanguage: 'en-US',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Converters', item: `${SITE_URL}/convert` },
        { '@type': 'ListItem', position: 3, name: `${from.label} to ${to.label}`, item: url },
      ],
    },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL, logo: { '@type': 'ImageObject', url: SITE_LOGO } },
  };

  // Globe focus: use representative cities for the two zones when resolvable.
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
                  {summary} {from.label} is {from.full}; {to.label} is {to.full}. The table below shows the conversion for
                  every part of the day, with daylight saving time handled automatically.
                </p>

                <FactGrid
                  items={[
                    { label: from.label, value: `${fromFacts.nowTime} (${fromFacts.offsetLabel})` },
                    { label: to.label, value: `${toFacts.nowTime} (${toFacts.offsetLabel})` },
                    { label: 'Difference', value: diff === 0 ? 'None' : `${Math.abs(diff)}h` },
                  ]}
                />

                <h2 className={ui.title} style={{ fontSize: '18px', margin: '22px 0 10px' }}>
                  {from.label} → {to.label} conversion table
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
                            {row.dayNote !== 'same day' && (
                              <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}> ({row.dayNote})</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: '16px' }}>
                  Need a specific date or a different pair? Use the interactive globe and the{' '}
                  <Link href="/compare" className={ui.link}>Compare</Link> tab to preview any moment, including future
                  dates that cross a daylight saving boundary. To schedule a call between these zones, try the{' '}
                  <Link href="/planner" className={ui.link}>Meeting Planner</Link>.
                </p>

                <div className={ui.divider} />
                <h2 className={ui.title} style={{ fontSize: '18px', marginBottom: '12px' }}>
                  Related converters
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
