import { notFound } from 'next/navigation';
import Link from 'next/link';
import styles from '@/components/layout/layout.module.css';
import ui from '@/components/ui/ui.module.css';
import { PageStage } from '@/components/programmatic/PageStage';
import { JsonLd } from '@/components/seo/JsonLd';
import { FaqList, faqJsonLd, type FaqItem } from '@/components/seo/FaqList';
import { FactGrid } from '@/components/programmatic/FactGrid';
import { LiveClock } from '@/components/ui/LiveClock';
import { popularCities } from '@/data/seoLinks';
import { getZoneFacts, resolveCity, citySlug, cityShortName } from '@/lib/timeData';
import { SITE_URL, SITE_NAME, SITE_LOGO } from '@/lib/site';

export const revalidate = 1800;

type Params = { city: string };

export function generateStaticParams() {
  return popularCities.map((c) => ({ city: c.slug }));
}

export default async function TimeCityPage({ params }: { params: Promise<Params> }) {
  const { city: slug } = await params;
  const city = resolveCity(slug);
  if (!city) notFound();

  const cityName = cityShortName(city);
  const canonicalSlug = citySlug(city);
  const facts = getZoneFacts(city.tz);
  const path = `/time/${canonicalSlug}`;
  const url = `${SITE_URL}${path}`;

  const dstSentence = facts.observesDst
    ? `${cityName} observes daylight saving time, so its UTC offset shifts by one hour between standard and summer time.`
    : `${cityName} does not observe daylight saving time, so its UTC offset (${facts.offsetLabel}) stays the same all year.`;
  const nextT = facts.transitions[0];

  const faqs: FaqItem[] = [
    {
      question: `What time is it in ${cityName} right now?`,
      answer: `As of ${facts.nowDate}, the local time in ${cityName} is around ${facts.nowTime} (${facts.abbr ?? facts.offsetLabel}). The clock at the top of this page ticks in real time, and the offset shown is ${facts.offsetLabel}.`,
    },
    {
      question: `What time zone is ${cityName} in?`,
      answer: `${cityName} uses the ${city.tz} IANA time zone${facts.abbr ? `, currently abbreviated ${facts.abbr}` : ''}. Its current offset from Coordinated Universal Time is ${facts.offsetLabel}.`,
    },
    {
      question: `Does ${cityName} observe daylight saving time?`,
      answer: facts.observesDst
        ? `Yes. ${dstSentence}${nextT ? ` The next change is on ${nextT.whenDate}, when the clocks ${nextT.type === 'begins' ? 'move forward' : 'move back'} and the offset becomes ${nextT.toOffsetLabel}.` : ''}`
        : dstSentence,
    },
    {
      question: `What is the UTC offset for ${cityName}?`,
      answer: `${cityName} is currently at ${facts.offsetLabel}. ${facts.observesDst ? 'This offset changes by one hour during the daylight saving period.' : 'This offset is fixed throughout the year.'}`,
    },
  ];

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Current Time in ${cityName}`,
    description: `Live local time in ${cityName} (${city.tz}). Current UTC offset ${facts.offsetLabel}${facts.abbr ? `, ${facts.abbr}` : ''}, with daylight saving status and the next clock change.`,
    url,
    inLanguage: 'en-US',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'World Clock', item: `${SITE_URL}/time` },
        { '@type': 'ListItem', position: 3, name: cityName, item: url },
      ],
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: SITE_LOGO },
    },
  };

  const init = {
    tab: 'explore' as const,
    mode: 'select' as const,
    locations: [{ lat: city.lat, lng: city.lng, label: city.label }],
    focus: { lat: city.lat, lng: city.lng, altitude: 1.6 },
  };

  const related = popularCities.filter((c) => c.slug !== canonicalSlug).slice(0, 6);

  return (
    <>
      <JsonLd data={webPage} id="ld-webpage" />
      <JsonLd data={faqJsonLd(faqs)} id="ld-faq" />
      <PageStage init={init}>
        <div className={styles.infoSection}>
          <div className={styles.infoCardWrapper}>
            <div className={ui.card}>
              <div className={ui.cardBody}>
                <h1 className={ui.title} style={{ marginBottom: '6px', fontSize: '26px' }}>
                  Current Time in {cityName}
                </h1>
                <p style={{ fontSize: '34px', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0 2px', fontVariantNumeric: 'tabular-nums' }}>
                  <LiveClock tz={city.tz} initial={facts.nowTime} />
                </p>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '18px' }}>
                  {facts.nowDate} · {facts.abbr ?? 'Local time'} ({facts.offsetLabel})
                </p>

                <FactGrid
                  items={[
                    { label: 'Time zone', value: city.tz },
                    { label: 'UTC offset', value: facts.offsetLabel },
                    { label: 'Abbreviation', value: facts.abbr ?? '—' },
                    { label: 'Daylight saving', value: facts.observesDst ? (facts.isDst ? 'In effect now' : 'Observed (not active)') : 'Not observed' },
                  ]}
                />

                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: '18px' }}>
                  The current local time in {cityName} is <strong>{facts.nowTime}</strong> on {facts.nowDate}.
                  {cityName} runs on the <strong>{city.tz}</strong> time zone, which is presently {facts.offsetLabel}
                  {facts.abbr ? ` (${facts.abbr})` : ''}. {dstSentence}
                </p>

                {nextT && (
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: '12px' }}>
                    <strong>Next clock change:</strong> {nextT.whenDate} — {nextT.label}. The UTC offset moves from{' '}
                    {nextT.fromOffsetLabel} to {nextT.toOffsetLabel}. Plan calls and travel around this date to avoid
                    being an hour off.
                  </p>
                )}

                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: '12px' }}>
                  Use the interactive globe above to compare {cityName} with other cities, or open the{' '}
                  <Link href="/compare" className={ui.link}>Compare</Link> tab to line up several time zones side by side.
                  Planning a call? The{' '}
                  <Link href="/planner" className={ui.link}>Meeting Planner</Link> finds overlapping working hours
                  automatically, and the{' '}
                  <Link href="/dst" className={ui.link}>DST checker</Link> tracks upcoming clock changes.
                </p>

                <div className={ui.divider} />
                <h2 className={ui.title} style={{ fontSize: '18px', marginBottom: '12px' }}>
                  Current time in other cities
                </h2>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '8px' }}>
                  {related.map((c) => (
                    <li key={c.slug}>
                      <Link href={`/time/${c.slug}`} className={ui.link} style={{ fontSize: '14px' }}>
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
