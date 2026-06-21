import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { parseConvertPair } from '@/lib/timeData';
import { pageMetadata } from '@/lib/i18nMeta';
import type { Locale } from '@/i18n/routing';

type Params = { locale: string; pair: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, pair } = await params;
  const parsed = parseConvertPair(pair);
  if (!parsed) return { robots: { index: false, follow: false } };
  const { from, to } = parsed;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return pageMetadata({
    locale: locale as Locale,
    path: `/convert/${pair}`,
    title: t('convert.title', { from: from.label, to: to.label }),
    description: t('convert.description', { from: from.label, to: to.label }),
  });
}

export default function ConvertPairLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
