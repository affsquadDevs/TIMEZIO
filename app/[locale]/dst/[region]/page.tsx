import { notFound } from 'next/navigation';
import Link from 'next/link';
import styles from '@/components/layout/layout.module.css';
import ui from '@/components/ui/ui.module.css';
import { PageStage } from '@/components/programmatic/PageStage';
import { JsonLd } from '@/components/seo/JsonLd';
import { FaqList, faqJsonLd, type FaqItem } from '@/components/seo/FaqList';
import { FactGrid } from '@/components/programmatic/FactGrid';
import { popularDst } from '@/data/seoLinks';
import { getDstRegion, cityShortName } from '@/lib/timeData';
import { SITE_URL, SITE_NAME, SITE_LOGO } from '@/lib/site';

export const revalidate = 1800;

type Params = { region: string };

export function generateStaticParams() {
  return popularDst.map((d) => ({ region: d.slug }));
}

export default async function DstRegionPage({ params }: { params: Promise<Params> }) {
  const { region } = await params;
  const data = getDstRegion(region);
  if (!data) notFound();

  const { regionLabel, city, facts, observesDst } = data;
  const cityName = cityShortName(city);
  const path = `/dst/${region}`;
  const url = `${SITE_URL}${path}`;
  const heading = `${regionLabel} Daylight Saving Time`;

  const begins = facts.transitions.find((t) => t.type === 'begins');
  const ends = facts.transitions.find((t) => t.type === 'ends');

  const intro = observesDst
    ? `${regionLabel} observes daylight saving time. Clocks are currently ${facts.isDst ? 'on summer time (DST in effect)' : 'on standard time'}, at ${facts.offsetLabel}. The reference zone for ${regionLabel} is ${city.tz} (${cityName}).`
    : `${regionLabel} does not currently observe daylight saving time. The offset stays at ${facts.offsetLabel} all year. The reference zone is ${city.tz} (${cityName}).`;

  const faqs: FaqItem[] = [
    {
      question: `Does ${regionLabel} observe daylight saving time?`,
      answer: observesDst
        ? `Yes. ${regionLabel} changes its clocks twice a year. It is currently ${facts.isDst ? 'on daylight saving (summer) time' : 'on standard time'} at ${facts.offsetLabel}.`
        : `No. ${regionLabel} keeps a fixed offset of ${facts.offsetLabel} throughout the year and does not change its clocks.`,
    },
    {
      question: `When do the clocks change in ${regionLabel}?`,
      answer: observesDst
        ? `${begins ? `Clocks next spring forward on ${begins.whenDate} (offset ${begins.fromOffsetLabel} → ${begins.toOffsetLabel}). ` : ''}${ends ? `Clocks next fall back on ${ends.whenDate} (offset ${ends.fromOffsetLabel} → ${ends.toOffsetLabel}).` : ''}`.trim() || `${regionLabel} observes DST; exact dates depend on the year.`
        : `${regionLabel} does not change its clocks, so there is no spring-forward or fall-back date.`,
    },
    {
      question: `What is the current UTC offset for ${regionLabel}?`,
      answer: `${regionLabel} is currently at ${facts.offsetLabel}${facts.abbr ? ` (${facts.abbr})` : ''}. ${observesDst ? 'This shifts by one hour when daylight saving begins or ends.' : 'This offset is fixed.'}`,
    },
  ];

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: heading,
    description: intro,
    url,
    inLanguage: 'en-US',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Daylight Saving Time', item: `${SITE_URL}/dst` },
        { '@type': 'ListItem', position: 3, name: regionLabel, item: url },
      ],
    },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL, logo: { '@type': 'ImageObject', url: SITE_LOGO } },
  };

  const init = {
    tab: 'dst' as const,
    mode: 'select' as const,
    locations: [{ lat: city.lat, lng: city.lng, label: city.label }],
    focus: { lat: city.lat, lng: city.lng, altitude: 1.6 },
  };

  const related = popularDst.filter((d) => d.slug !== region).slice(0, 5);

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
                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>{intro}</p>

                <FactGrid
                  items={[
                    { label: 'Observes DST', value: observesDst ? 'Yes' : 'No' },
                    { label: 'Current offset', value: facts.offsetLabel },
                    { label: 'Status', value: facts.isDst ? 'Summer time' : 'Standard time' },
                    { label: 'Reference zone', value: city.tz },
                  ]}
                />

                {observesDst && (begins || ends) && (
                  <>
                    <h2 className={ui.title} style={{ fontSize: '18px', margin: '22px 0 10px' }}>
                      Next clock changes
                    </h2>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                          <tr>
                            <th style={thStyle}>Change</th>
                            <th style={thStyle}>Date</th>
                            <th style={thStyle}>Offset</th>
                          </tr>
                        </thead>
                        <tbody>
                          {facts.transitions.map((t, i) => (
                            <tr key={i}>
                              <td style={tdStyle}>{t.type === 'begins' ? 'Spring forward (DST begins)' : 'Fall back (DST ends)'}</td>
                              <td style={tdStyle}>{t.whenDate}</td>
                              <td style={tdStyle}>{t.fromOffsetLabel} → {t.toOffsetLabel}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: '16px' }}>
                  Daylight saving changes shift {regionLabel}&apos;s offset by an hour, which can quietly break recurring
                  meetings. Check the live difference against your own zone with the{' '}
                  <Link href="/compare" className={ui.link}>Compare</Link> tab, or schedule around the change using the{' '}
                  <Link href="/planner" className={ui.link}>Meeting Planner</Link>.
                </p>

                <div className={ui.divider} />
                <h2 className={ui.title} style={{ fontSize: '18px', marginBottom: '12px' }}>
                  DST in other regions
                </h2>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '8px' }}>
                  {related.map((d) => (
                    <li key={d.slug}>
                      <Link href={`/dst/${d.slug}`} className={ui.link} style={{ fontSize: '14px' }}>
                        {d.label}
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
