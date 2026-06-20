import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { resolveCity, citySlug, cityShortName } from '@/lib/timeData';
import { pageMetadata } from '@/lib/i18nMeta';
import type { Locale } from '@/i18n/routing';

type Params = { locale: string; city: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, city } = await params;
  const c = resolveCity(city);
  if (!c) return { robots: { index: false, follow: false } };
  const name = cityShortName(c);
  const t = await getTranslations({ locale, namespace: 'meta' });
  return pageMetadata({
    locale: locale as Locale,
    path: `/time/${citySlug(c)}`,
    title: t('time.title', { city: name }),
    description: t('time.description', { city: name }),
  });
}

export default function TimeCityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
