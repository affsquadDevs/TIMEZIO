import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getDstRegion } from '@/lib/timeData';
import { pageMetadata } from '@/lib/i18nMeta';
import type { Locale } from '@/i18n/routing';

type Params = { locale: string; region: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, region } = await params;
  const data = getDstRegion(region, locale);
  if (!data) return { robots: { index: false, follow: false } };
  const t = await getTranslations({ locale, namespace: 'meta' });
  return pageMetadata({
    locale: locale as Locale,
    path: `/dst/${region}`,
    title: t('dst.title', { region: data.regionLabel }),
    description: t('dst.description', { region: data.regionLabel }),
  });
}

export default function DstRegionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
