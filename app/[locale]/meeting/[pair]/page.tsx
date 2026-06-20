import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
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

type Params = { locale: string; pair: string };

export function generateStaticParams() {
  return popularMeetings.map((m) => ({ pair: m.slug }));
}

export default async function MeetingPairPage({ params }: { params: Promise<Params> }) {
  const { locale, pair } = await params;
  setRequestLocale(locale);
  const { cityA, cityB } = parseMeetingPair(pair) as { cityA: City | null; cityB: City | null };
  if (!cityA || !cityB) notFound();

  const t = await getTranslations('prog.meeting');
  const tc = await getTranslations('common');

  const nameA = cityShortName(cityA);
  const nameB = cityShortName(cityB);
  const factsA = getZoneFacts(cityA.tz, locale);
  const factsB = getZoneFacts(cityB.tz, locale);
  const overlap = buildMeetingOverlap(cityA.tz, cityB.tz, locale);
  const url = `${SITE_URL}/meeting/${pair}`;
  const heading = t('h1', { a: nameA, b: nameB });

  const overlapArgs = {
    hasOverlap: overlap.hasOverlap ? 'yes' : 'no',
    a: nameA,
    b: nameB,
    start: overlap.overlapHours[0]?.a ?? '',
    end: overlap.overlapHours[overlap.overlapHours.length - 1]?.a ?? '',
    bestA: overlap.best?.a ?? '',
    bestB: overlap.best?.b ?? '',
  };
  const overlapSentence = t('overlapSentence', overlapArgs);

  const faqs: FaqItem[] = [
    { question: t('faq1q', { a: nameA, b: nameB }), answer: t('faq1a', { hasOverlap: overlap.hasOverlap ? 'yes' : 'no', bestA: overlap.best?.a ?? '', a: nameA, bestB: overlap.best?.b ?? '', b: nameB }) },
    { question: t('faq2q', { a: nameA, b: nameB }), answer: t('faq2a', { a: nameA, offsetA: factsA.offsetLabel, b: nameB, offsetB: factsB.offsetLabel }) },
    { question: t('faq3q', { a: nameA, b: nameB }), answer: t('faq3a', { a: nameA, b: nameB }) },
  ];

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: heading,
    description: t('wpDesc', { a: nameA, b: nameB, overlap: overlapSentence }),
    url,
    inLanguage: locale,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: tc('breadcrumbHome'), item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: t('breadcrumb'), item: `${SITE_URL}/meeting` },
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
                  {overlapSentence} {t('introTail')}
                </p>

                <FactGrid
                  items={[
                    { label: nameA, value: `${factsA.nowTime} (${factsA.offsetLabel})` },
                    { label: nameB, value: `${factsB.nowTime} (${factsB.offsetLabel})` },
                    { label: t('sharedWorkHours'), value: overlap.hasOverlap ? t('hoursUnit', { count: overlap.overlapHours.length }) : t('noneWorkHours') },
                  ]}
                />

                <h2 className={ui.title} style={{ fontSize: '18px', margin: '22px 0 10px' }}>
                  {t('tableHeading')}
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
                    {t('noOverlapBody')}
                  </p>
                )}

                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: '16px' }}>
                  {t.rich('crosslinks', {
                    a: nameA,
                    b: nameB,
                    compare: (c) => <Link href="/compare" className={ui.link}>{c}</Link>,
                  })}
                </p>

                <div className={ui.divider} />
                <h2 className={ui.title} style={{ fontSize: '18px', marginBottom: '12px' }}>
                  {t('relatedHeading')}
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
