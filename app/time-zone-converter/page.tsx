import type { Metadata } from 'next';
import Script from 'next/script';
import TimeZoneConverterClient from './Client';

export const metadata: Metadata = {
  title: 'Time Zone Converter – Compare Times, Plan Meetings & Explore Cities',
  description:
    'Compare time zones between cities, plan meetings across regions, and explore local times worldwide. DST-aware, accurate, and free.',
};

export default function TimeZoneConverterPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Timezio Time Zone Converter',
    url: 'https://timezio.com/time-zone-converter',
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
      <Script id="ld-webapp-timezone-converter" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(jsonLd)}
      </Script>
      <TimeZoneConverterClient />
    </>
  );
}

