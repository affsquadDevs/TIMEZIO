import { notFound } from 'next/navigation';
import Link from 'next/link';
import styles from '@/components/layout/layout.module.css';
import ui from '@/components/ui/ui.module.css';
import { PageStage } from '@/components/programmatic/PageStage';
import { JsonLd } from '@/components/seo/JsonLd';
import { FaqList, faqJsonLd, type FaqItem } from '@/components/seo/FaqList';
import { FactGrid } from '@/components/programmatic/FactGrid';
import { popularMeetings } from '@/data/seoLinks';
import { parseMeetingPair } from '@/utils/cityMapper';
import { buildMeetingOverlap, getZoneFacts, cityShortName, type City } from '@/lib/timeData';
import { SITE_URL, SITE_NAME, SITE_LOGO } from '@/lib/site';

export const revalidate = 1800;

type Params = { pair: string };

export function generateStaticParams() {
  return popularMeetings.map((m) => ({ pair: m.slug }));
}

export default async function MeetingPairPage({ params }: { params: Promise<Params> }) {
  const { pair } = await params;
  const { cityA, cityB } = parseMeetingPair(pair) as { cityA: City | null; cityB: City | null };
  if (!cityA || !cityB) notFound();

  const nameA = cityShortName(cityA);
  const nameB = cityShortName(cityB);
  const factsA = getZoneFacts(cityA.tz);
  const factsB = getZoneFacts(cityB.tz);
  const overlap = buildMeetingOverlap(cityA.tz, cityB.tz);
  const path = `/meeting/${pair}`;
  const url = `${SITE_URL}${path}`;
  const heading = `Best Meeting Time: ${nameA} ↔ ${nameB}`;

  const overlapSentence = overlap.hasOverlap
    ? `Standard 9-to-5 working hours in ${nameA} and ${nameB} overlap from ${overlap.overlapHours[0].a} to ${overlap.overlapHours[overlap.overlapHours.length - 1].a} ${nameA} time. A good middle slot is around ${overlap.best?.a} in ${nameA} (${overlap.best?.b} in ${nameB}).`
    : `Standard 9-to-5 working hours in ${nameA} and ${nameB} do not overlap, so one side will need an early or late slot. Aim for the start of one city's day and the end of the other's.`;

  const faqs: FaqItem[] = [
    {
      question: `What is the best time to schedule a meeting between ${nameA} and ${nameB}?`,
      answer: overlap.hasOverlap
        ? `The cleanest option is around ${overlap.best?.a} in ${nameA}, which is ${overlap.best?.b} in ${nameB} — inside both teams' working day. The overlap table on this page lists every shared hour for today.`
        : `There is no clean overlap during standard hours, so pick the least disruptive edge: early morning for one city or early evening for the other. The table on this page shows each hour side by side.`,
    },
    {
      question: `What is the time difference between ${nameA} and ${nameB}?`,
      answer: `${nameA} is currently ${factsA.offsetLabel} and ${nameB} is ${factsB.offsetLabel}. The difference can move by an hour around daylight saving transitions, which this tool accounts for automatically.`,
    },
    {
      question: `How do I plan a recurring call across ${nameA} and ${nameB}?`,
      answer: `Use the Planner tab above — both cities are pre-loaded. Set each participant's working hours and Timezio highlights overlapping slots and warns about early-morning or late-night times.`,
    },
  ];

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: heading,
    description: `Find the best meeting time between ${nameA} and ${nameB}. ${overlapSentence}`,
    url,
    inLanguage: 'en-US',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Meeting Planner', item: `${SITE_URL}/meeting` },
        { '@type': 'ListItem', position: 3, name: `${nameA} to ${nameB}`, item: url },
      ],
    },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL, logo: { '@type': 'ImageObject', url: SITE_LOGO } },
  };

  const init = {
    tab: 'planner' as const,
    mode: 'planner' as const,
    locations: [
      { lat: cityA.lat, lng: cityA.lng, label: cityA.label },
      { lat: cityB.lat, lng: cityB.lng, label: cityB.label },
    ],
    focus: { lat: (cityA.lat + cityB.lat) / 2, lng: (cityA.lng + cityB.lng) / 2, altitude: 2.5 },
  };

  const related = popularMeetings.filter((m) => m.slug !== pair).slice(0, 5);

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
                  {overlapSentence} All times below are for today and adjust automatically for daylight saving time.
                </p>

                <FactGrid
                  items={[
                    { label: nameA, value: `${factsA.nowTime} (${factsA.offsetLabel})` },
                    { label: nameB, value: `${factsB.nowTime} (${factsB.offsetLabel})` },
                    { label: 'Shared work hours', value: overlap.hasOverlap ? `${overlap.overlapHours.length} h` : 'None (9–5)' },
                  ]}
                />

                <h2 className={ui.title} style={{ fontSize: '18px', margin: '22px 0 10px' }}>
                  Overlapping working hours
                </h2>
                {overlap.hasOverlap ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                      <thead>
                        <tr>
                          <th style={thStyle}>{nameA}</th>
                          <th style={thStyle}>{nameB}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overlap.overlapHours.map((row, i) => (
                          <tr key={i}>
                            <td style={tdStyle}>{row.a}</td>
                            <td style={tdStyle}>{row.b}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    No 9-to-5 overlap today. Open the Planner above to widen working hours or pick an edge slot that works
                    for both teams.
                  </p>
                )}

                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: '16px' }}>
                  The Planner tab above already has {nameA} and {nameB} loaded. Adjust each participant&apos;s hours, set a
                  duration, and Timezio ranks the best slots. To double-check the raw offset, use the{' '}
                  <Link href="/compare" className={ui.link}>Compare</Link> tab.
                </p>

                <div className={ui.divider} />
                <h2 className={ui.title} style={{ fontSize: '18px', marginBottom: '12px' }}>
                  More meeting pairs
                </h2>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '8px' }}>
                  {related.map((m) => (
                    <li key={m.slug}>
                      <Link href={`/meeting/${m.slug}`} className={ui.link} style={{ fontSize: '14px' }}>
                        {m.label}
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
