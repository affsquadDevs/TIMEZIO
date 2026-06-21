import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { parseMeetingPair } from '@/utils/cityMapper';
import { cityShortName, type City } from '@/lib/timeData';
import { pageMetadata } from '@/lib/i18nMeta';
import type { Locale } from '@/i18n/routing';

type Params = { locale: string; pair: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, pair } = await params;
  const { cityA, cityB } = parseMeetingPair(pair) as { cityA: City | null; cityB: City | null };
  if (!cityA || !cityB) return { robots: { index: false, follow: false } };
  const t = await getTranslations({ locale, namespace: 'meta' });
  return pageMetadata({
    locale: locale as Locale,
    path: `/meeting/${pair}`,
    title: t('meeting.title', { a: cityShortName(cityA), b: cityShortName(cityB) }),
    description: t('meeting.description', { a: cityShortName(cityA), b: cityShortName(cityB) }),
  });
}

export default function MeetingPairLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
