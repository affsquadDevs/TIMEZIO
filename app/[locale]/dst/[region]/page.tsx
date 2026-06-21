import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
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

type Params = { locale: string; region: string };

export function generateStaticParams() {
  return popularDst.map((d) => ({ region: d.slug }));
}

export default async function DstRegionPage({ params }: { params: Promise<Params> }) {
  const { locale, region } = await params;
  setRequestLocale(locale);
  const data = getDstRegion(region, locale);
  if (!data) notFound();

  const t = await getTranslations('prog.dst');
  const tc = await getTranslations('common');

  const { regionLabel, city, facts, observesDst } = data;
  const cityName = cityShortName(city);
  const url = `${SITE_URL}/dst/${region}`;
  const heading = t('h1', { region: regionLabel });

  const begins = facts.transitions.find((tr) => tr.type === 'begins');
  const ends = facts.transitions.find((tr) => tr.type === 'ends');
  const observesSel = observesDst ? 'yes' : 'no';

  const intro = t('intro', { observesDst: observesSel, region: regionLabel, isDst: facts.isDst ? 'yes' : 'no', offset: facts.offsetLabel, tz: city.tz, city: cityName });

  const faqs: FaqItem[] = [
    { question: t('faq1q', { region: regionLabel }), answer: t('faq1a', { observesDst: observesSel, region: regionLabel, isDst: facts.isDst ? 'yes' : 'no', offset: facts.offsetLabel }) },
    {
      question: t('faq2q', { region: regionLabel }),
      answer: t('faq2a', {
        observesDst: observesSel,
        region: regionLabel,
        hasBegins: begins ? 'yes' : 'no',
        beginsDate: begins?.whenDate ?? '',
        beginsFrom: begins?.fromOffsetLabel ?? '',
        beginsTo: begins?.toOffsetLabel ?? '',
        hasEnds: ends ? 'yes' : 'no',
        endsDate: ends?.whenDate ?? '',
        endsFrom: ends?.fromOffsetLabel ?? '',
        endsTo: ends?.toOffsetLabel ?? '',
      }),
    },
    { question: t('faq3q', { region: regionLabel }), answer: t('faq3a', { region: regionLabel, offset: facts.offsetLabel, hasAbbr: facts.abbr ? 'yes' : 'no', abbr: facts.abbr ?? '', observesDst: observesSel }) },
  ];

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: heading,
    description: intro,
    url,
    inLanguage: locale,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: tc('breadcrumbHome'), item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: t('breadcrumb'), item: `${SITE_URL}/dst` },
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
                    { label: t('factObservesDst'), value: observesDst ? t('yes') : t('no') },
                    { label: t('factCurrentOffset'), value: facts.offsetLabel },
                    { label: t('factStatus'), value: facts.isDst ? t('summerTime') : t('standardTime') },
                    { label: t('factReferenceZone'), value: city.tz },
                  ]}
                />

                {observesDst && (begins || ends) && (
                  <>
                    <h2 className={ui.title} style={{ fontSize: '18px', margin: '22px 0 10px' }}>
                      {t('changesHeading')}
                    </h2>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                          <tr>
                            <th style={thStyle}>{t('colChange')}</th>
                            <th style={thStyle}>{t('colDate')}</th>
                            <th style={thStyle}>{t('colOffset')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {facts.transitions.map((tr, i) => (
                            <tr key={i}>
                              <td style={tdStyle}>{tr.type === 'begins' ? t('springForward') : t('fallBack')}</td>
                              <td style={tdStyle}>{tr.whenDate}</td>
                              <td style={tdStyle}>{tr.fromOffsetLabel} → {tr.toOffsetLabel}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: '16px' }}>
                  {t.rich('crosslinks', {
                    region: regionLabel,
                    compare: (c) => <Link href="/compare" className={ui.link}>{c}</Link>,
                    planner: (c) => <Link href="/planner" className={ui.link}>{c}</Link>,
                  })}
                </p>

                <div className={ui.divider} />
                <h2 className={ui.title} style={{ fontSize: '18px', marginBottom: '12px' }}>
                  {t('relatedHeading')}
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
