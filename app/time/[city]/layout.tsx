import type { Metadata } from 'next';
import { resolveCity, citySlug, cityShortName, getZoneFacts } from '@/lib/timeData';
import { SITE_URL, SITE_NAME, OG_IMAGE } from '@/lib/site';

type Params = { city: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { city: slug } = await params;
  const city = resolveCity(slug);

  if (!city) {
    return { title: 'City not found', robots: { index: false, follow: false } };
  }

  const cityName = cityShortName(city);
  const facts = getZoneFacts(city.tz);
  const canonical = `/time/${citySlug(city)}`;
  const title = `Current Time in ${cityName} (${facts.abbr ?? facts.offsetLabel})`;
  const description = `What time is it in ${cityName} right now? Live local time, current UTC offset (${facts.offsetLabel}), time zone (${city.tz}) and daylight saving status, updated in real time.`;

  return {
    title,
    description,
    keywords: [`time in ${cityName}`, `${cityName} time now`, `current time ${cityName}`, `${cityName} time zone`, `world clock ${cityName}`],
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${canonical}`,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'en_US',
      images: [{ url: OG_IMAGE, alt: `Current time in ${cityName} on Timezio`, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [OG_IMAGE] },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  };
}

export default function TimeCityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
