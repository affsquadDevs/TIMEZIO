import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { SITE_URL, OG_IMAGE, SITE_NAME } from '@/lib/site';
import TimeZoneConverterClient from './Client';

export const metadata: Metadata = {
  title: 'Time Zone Converter – Compare Times, Plan Meetings & Explore Cities',
  description:
    'Compare time zones between cities, plan meetings across regions, and explore local times worldwide. DST-aware, accurate, and free.',
  alternates: { canonical: '/time-zone-converter' },
  openGraph: {
    title: 'Time Zone Converter | Timezio',
    description: 'Compare time zones, plan meetings, and explore local times worldwide. DST-aware and free.',
    url: `${SITE_URL}/time-zone-converter`,
    siteName: SITE_NAME,
    type: 'website',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Timezio time zone converter' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Time Zone Converter | Timezio',
    description: 'Compare time zones, plan meetings, and explore local times worldwide.',
    images: [OG_IMAGE],
  },
};

export default function TimeZoneConverterPage() {
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

