import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
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

type Params = { locale: string; city: string };

export function generateStaticParams() {
  return popularCities.map((c) => ({ city: c.slug }));
}

export default async function TimeCityPage({ params }: { params: Promise<Params> }) {
  const { locale, city: slug } = await params;
  setRequestLocale(locale);
  const city = resolveCity(slug);
  if (!city) notFound();

  const t = await getTranslations('prog.time');
  const tc = await getTranslations('common');

  const cityName = cityShortName(city);
  const canonicalSlug = citySlug(city);
  const facts = getZoneFacts(city.tz, locale);
  const url = `${SITE_URL}/time/${canonicalSlug}`;

  const offsetAbbr = facts.abbr ? `${facts.offsetLabel} (${facts.abbr})` : facts.offsetLabel;
  const observesSel = facts.observesDst ? 'yes' : 'no';
  const nextT = facts.transitions[0];
  const daylightValue = facts.observesDst
    ? facts.isDst ? t('daylightInEffect') : t('daylightObservedInactive')
    : t('daylightNotObserved');

  const faqs: FaqItem[] = [
    { question: t('faq1q', { city: cityName }), answer: t('faq1a', { date: facts.nowDate, city: cityName, time: facts.nowTime, abbr: facts.abbr ?? facts.offsetLabel, offset: facts.offsetLabel }) },
    { question: t('faq2q', { city: cityName }), answer: t('faq2a', { city: cityName, tz: city.tz, hasAbbr: facts.abbr ? 'yes' : 'no', abbr: facts.abbr ?? '', offset: facts.offsetLabel }) },
    { question: t('faq3q', { city: cityName }), answer: t('faq3a', { observesDst: observesSel, city: cityName, hasNext: nextT ? 'yes' : 'no', nextDate: nextT?.whenDate ?? '', nextDir: nextT ? (nextT.type === 'begins' ? 'forward' : 'back') : 'forward', nextOffset: nextT?.toOffsetLabel ?? '', offset: facts.offsetLabel }) },
    { question: t('faq4q', { city: cityName }), answer: t('faq4a', { city: cityName, offset: facts.offsetLabel, observesDst: observesSel }) },
  ];

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: t('wpName', { city: cityName }),
    description: t('wpDesc', { city: cityName, tz: city.tz, offsetAbbr }),
    url,
    inLanguage: locale,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: tc('breadcrumbHome'), item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: t('breadcrumb'), item: `${SITE_URL}/time` },
        { '@type': 'ListItem', position: 3, name: cityName, item: url },
      ],
    },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL, logo: { '@type': 'ImageObject', url: SITE_LOGO } },
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
                  {t('h1', { city: cityName })}
                </h1>
                <p style={{ fontSize: '34px', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0 2px', fontVariantNumeric: 'tabular-nums' }}>
                  <LiveClock tz={city.tz} initial={facts.nowTime} />
                </p>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '18px' }}>
                  {t('dateLine', { date: facts.nowDate, abbr: facts.abbr ?? t('localTime'), offset: facts.offsetLabel })}
                </p>

                <FactGrid
                  items={[
                    { label: t('factTimeZone'), value: city.tz },
                    { label: t('factUtcOffset'), value: facts.offsetLabel },
                    { label: t('factAbbreviation'), value: facts.abbr ?? '—' },
                    { label: t('factDaylight'), value: daylightValue },
                  ]}
                />

                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: '18px' }}>
                  {t.rich('introMain', { city: cityName, time: facts.nowTime, date: facts.nowDate, tz: city.tz, offsetAbbr, b: (c) => <strong>{c}</strong> })}{' '}
                  {t('dstSentence', { observesDst: observesSel, city: cityName, offset: facts.offsetLabel })}
                </p>

                {nextT && (
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: '12px' }}>
                    {t.rich('nextChange', {
                      date: nextT.whenDate,
                      label: t('transitionLabel', { type: nextT.type }),
                      fromOffset: nextT.fromOffsetLabel,
                      toOffset: nextT.toOffsetLabel,
                      b: (c) => <strong>{c}</strong>,
                    })}
                  </p>
                )}

                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: '12px' }}>
                  {t.rich('crosslinks', {
                    city: cityName,
                    compare: (c) => <Link href="/compare" className={ui.link}>{c}</Link>,
                    planner: (c) => <Link href="/planner" className={ui.link}>{c}</Link>,
                    dst: (c) => <Link href="/dst" className={ui.link}>{c}</Link>,
                  })}
                </p>

                <div className={ui.divider} />
                <h2 className={ui.title} style={{ fontSize: '18px', marginBottom: '12px' }}>
                  {t('relatedHeading')}
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
