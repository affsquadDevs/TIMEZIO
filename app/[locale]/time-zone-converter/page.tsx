import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { JsonLd } from '@/components/seo/JsonLd';
import { SITE_URL } from '@/lib/site';
import { pageMetadata } from '@/lib/i18nMeta';
import type { Locale } from '@/i18n/routing';
import TimeZoneConverterClient from './Client';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return pageMetadata({ locale: locale as Locale, path: '/time-zone-converter', title: t('timeConverter.title'), description: t('timeConverter.description') });
}

export default async function TimeZoneConverterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Timezio Time Zone Converter',
    url: `${SITE_URL}/time-zone-converter`,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    description:
      'Compare time zones between cities, plan meetings across time zones, and explore local times worldwide with DST-aware accuracy.',
    featureList: [
      'Time zone comparison',
      'Meeting planning across time zones',
      'Local time exploration by city',
      'Daylight saving time aware conversions',
    ],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} id="ld-webapp-timezone-converter" />
      <TimeZoneConverterClient />
    </>
  );
}

